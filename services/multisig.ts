import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  erc20Abi,
  type Address,
  type Hex,
  type AbiFunction,
} from "viem";
import { abi, chain, multisig, tokens } from "../lib/config";
import type { Asset, Provider } from "../lib/workspace";
export function createKcpClient(rpc: string) {
  return createPublicClient({
    chain,
    transport: http(rpc, { timeout: 15000, retryCount: 1 }),
  });
}
export type KcpClient = ReturnType<typeof createKcpClient>;
export async function assertKcpChain(client: KcpClient) {
  if ((await client.getChainId()) !== chain.id)
    throw new Error("RPC의 체인 ID가 KCP Testnet(56357)과 다릅니다.");
}
export function readBalances(client: KcpClient, address: Address) {
  return Promise.allSettled([
    client
      .getBalance({ address })
      .then((balance) => ({ symbol: "KRW", decimals: 18, balance }) as Asset),
    ...tokens.map(async (token) => {
      const [balance, decimals, symbol] = await Promise.all([
        client.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address],
        }),
        client.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "decimals",
        }),
        client
          .readContract({
            address: token.address,
            abi: erc20Abi,
            functionName: "symbol",
          })
          .catch(() => token.symbol),
      ]);
      return { ...token, balance, decimals, symbol } as Asset;
    }),
  ]);
}
export async function readTreasury(client: KcpClient) {
  const read = (functionName: string, args: readonly unknown[] = []) =>
    client.readContract({ address: multisig, abi, functionName, args });
  return await Promise.all([
    readBalances(client, multisig),
    Promise.allSettled([
      read("getOwners"),
      read("numConfirmationsRequired"),
      read("getTransactionCount"),
    ]),
  ]);
}
export async function readProposals(
  client: KcpClient,
  count: bigint,
  account?: Address,
) {
  const read = (functionName: string, args: readonly unknown[]) =>
    client.readContract({ address: multisig, abi, functionName, args });
  const ids = Array.from(
    { length: Number(count > 20n ? 20n : count) },
    (_, i) => count - 1n - BigInt(i),
  );
  const submitHashByIndex = new Map<string, Hex>();
  const confirmTxsByIndex = new Map<string, { owner: Address; hash: Hex }[]>();
  try {
    const [submitLogs, confirmLogs] = await Promise.all([
      client.getContractEvents({
        address: multisig,
        abi,
        eventName: "SubmitTransaction",
        fromBlock: 0n,
        toBlock: "latest",
      }),
      client.getContractEvents({
        address: multisig,
        abi,
        eventName: "ConfirmTransaction",
        fromBlock: 0n,
        toBlock: "latest",
      }),
    ]);
    for (const log of submitLogs) {
      const txIndex = (log.args as { txIndex?: bigint }).txIndex;
      if (txIndex !== undefined)
        submitHashByIndex.set(txIndex.toString(), log.transactionHash);
    }
    for (const log of confirmLogs) {
      const args = log.args as { txIndex?: bigint; owner?: Address };
      if (args.txIndex === undefined || !args.owner) continue;
      const key = args.txIndex.toString();
      const list = confirmTxsByIndex.get(key) ?? [];
      list.push({ owner: args.owner, hash: log.transactionHash });
      confirmTxsByIndex.set(key, list);
    }
  } catch {
    // best-effort; some RPCs cap log range, tx hashes just won't show
  }
  return await Promise.all(
    ids.map(async (id) => {
      const [t, confirmed] = await Promise.all([
        read("getTransaction", [id]),
        account ? read("isConfirmed", [id, account]) : false,
      ]);
      const [to, value, data, executed, confirmations] = t as [
        Address,
        bigint,
        Hex,
        boolean,
        bigint,
      ];
      return {
        id,
        to,
        value,
        data,
        executed,
        confirmations,
        confirmed: Boolean(confirmed),
        submitTxHash: submitHashByIndex.get(id.toString()),
        confirmTxs: confirmTxsByIndex.get(id.toString()) ?? [],
      };
    }),
  );
}
export async function prepareContractWrite(
  client: KcpClient,
  provider: Provider,
  account: Address,
  functionName: string,
  args: readonly unknown[],
) {
  const wc = createWalletClient({
    chain,
    transport: custom(provider),
  });
  const [actual] = await wc.getAddresses();
  if (actual?.toLowerCase() !== account.toLowerCase())
    throw new Error("지갑 계정이 변경되었습니다. 다시 연결하세요.");
  if (
    (await wc.getChainId()) !== chain.id ||
    (await client.getChainId()) !== chain.id
  )
    throw new Error("지갑과 RPC를 KCP Testnet으로 설정하세요.");
  const simulation = await client.simulateContract({
    address: multisig,
    abi,
    functionName,
    args,
    account,
  });
  return () => wc.writeContract(simulation.request);
}
export async function prepareDeposit(
  client: KcpClient,
  provider: Provider,
  account: Address,
  to: Address,
  value: bigint,
  tokenAddress?: Address,
) {
  const wc = createWalletClient({
    chain,
    transport: custom(provider),
  });
  const [actual] = await wc.getAddresses();
  if (actual?.toLowerCase() !== account.toLowerCase())
    throw new Error("지갑 계정이 변경되었습니다. 다시 연결하세요.");
  if (
    (await wc.getChainId()) !== chain.id ||
    (await client.getChainId()) !== chain.id
  )
    throw new Error("지갑과 RPC를 KCP Testnet으로 설정하세요.");
  if (tokenAddress) {
    const simulation = await client.simulateContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [to, value],
      account,
    });
    return () => wc.writeContract(simulation.request);
  }
  return () => wc.sendTransaction({ account, chain, to, value });
}
export function waitForReceipt(
  client: KcpClient,
  options: Parameters<KcpClient["waitForTransactionReceipt"]>[0],
) {
  return client.waitForTransactionReceipt(options);
}
export function readInterface(
  client: KcpClient,
  fn: AbiFunction,
  args: readonly unknown[],
) {
  return client.readContract({
    address: multisig,
    abi: [fn],
    functionName: fn.name,
    args,
  });
}
