import { create } from "zustand";

import {
  connectTronLink,
  getTronNetwork,
  getPropertyIds,
  getProperty,
} from "../services/tronService";

const useTronStore = create((set) => ({
  walletAddress: null,
  connected: false,
  connecting: false,

  network: null,
  correctNetwork: false,

  propertyIds: [],
  loadingProperties: false,

  connectWallet: async () => {
    set({ connecting: true });

    try {
      const address = await connectTronLink();

      const networkInfo = getTronNetwork();

      set({
        walletAddress: address,
        connected: true,
        connecting: false,
        network: networkInfo.name,
        correctNetwork: networkInfo.isCorrect,
      });

      return address;
    } catch (error) {
      set({
        connecting: false,
        connected: false,
      });

      throw error;
    }
  },

  checkNetwork: () => {
    const networkInfo = getTronNetwork();

    set({
      network: networkInfo.name,
      correctNetwork: networkInfo.isCorrect,
    });

    return networkInfo;
  },

  loadPropertyIds: async () => {
    set({ loadingProperties: true });

    try {
      const ids = await getPropertyIds();

      set({
        propertyIds: ids || [],
        loadingProperties: false,
      });

      return ids;
    } catch (error) {
      set({
        loadingProperties: false,
      });

      throw error;
    }
  },

  loadProperty: async (propertyId) => {
    return await getProperty(propertyId);
  },

  disconnectWallet: () => {
    set({
      walletAddress: null,
      connected: false,
      network: null,
      correctNetwork: false,
      propertyIds: [],
    });
  },
}));

export default useTronStore;