import contractAbi from "../contracts/contract-abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export const connectTronLink = async () => {
  const provider = window.tron;

  if (!provider || !provider.isTronLink) {
    throw new Error("TronLink is not installed or was not detected.");
  }

  try {
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || !accounts.length) {
      throw new Error("Wallet address was not received.");
    }

    const address = accounts[0];

    const tronWeb = provider.tronWeb;

    if (!tronWeb || tronWeb === false) {
      throw new Error("TronWeb is not ready.");
    }

    return address;
  } catch (error) {
    console.error("TronLink connection error:", error);

    throw new Error(
      error?.message || "Failed to connect to TronLink."
    );
  }
};

export const getTronNetwork = () => {
  const provider = window.tron;

  if (!provider || !provider.tronWeb) {
    throw new Error("TronLink or TronWeb is not available.");
  }

  const tronWeb = provider.tronWeb;

  const fullNode =
    tronWeb.fullNode?.host ||
    tronWeb.fullNode?.host?.toString() ||
    "";

  const networkName = fullNode.toLowerCase().includes("nile")
    ? "Nile"
    : fullNode || "Unknown";

  return {
    name: networkName,
    isCorrect: networkName === "Nile",
  };
};

export const getContract = async () => {
  const provider = window.tron;

  if (!provider || !provider.tronWeb) {
    throw new Error("TronLink or TronWeb is not available.");
  }

  const tronWeb = provider.tronWeb;

  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address is not configured.");
  }

  const contract = await tronWeb.contract(
    contractAbi,
    CONTRACT_ADDRESS
  );

  return contract;
};

export const getPropertyIds = async () => {
  const contract = await getContract();

  const result = await contract
    .getPropertyIds()
    .call();

  return result || [];
};

export const getProperty = async (propertyId) => {
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  const contract = await getContract();

  return await contract
    .getProperty(propertyId)
    .call();
};