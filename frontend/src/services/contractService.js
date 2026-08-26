import contractAbi from "../contracts/contract-abi.json";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS;

const getTronWeb = () => {
  const provider = window.tron;

  if (!provider || !provider.tronWeb) {
    throw new Error(
      "TronLink or TronWeb is not available."
    );
  }

  return provider.tronWeb;
};

export const getContract = async () => {
  const tronWeb = getTronWeb();

  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "Contract address is not configured."
    );
  }

  return await tronWeb.contract(
    contractAbi,
    CONTRACT_ADDRESS
  );
};

export const getPropertyIdsFromBlockchain = async () => {
  const contract = await getContract();

  const propertyIds = await contract
    .getPropertyIds()
    .call();

  return propertyIds || [];
};

export const getPropertyFromBlockchain = async (
  propertyId
) => {
  if (!propertyId) {
    throw new Error(
      "Property ID is required."
    );
  }

  const contract = await getContract();

  return await contract
    .getProperty(propertyId)
    .call();
};
