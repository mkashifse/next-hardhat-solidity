import Web3 from "web3";

const useWeb3 = () => {
  const useConnect = () => {
    const web3 = new Web3(
      new Web3.providers.WebsocketProvider("ws://127.0.0.1:8545/")
    );

    const init = (callback) => {
      const Contract = web3.eth.Contract;
      const getAccountsAsync = web3.eth.getAccounts;
      const connector = window.ethereum;
      const connectWalletAsync = () =>
        new Promise((resolve, reject) => {
          connector
            .request({
              method: "eth_requestAccounts",
            })
            .then(resolve)
            .catch(reject);
        });

      callback({
        getAccountsAsync,
        connectWalletAsync,
        Contract,
      });
    };

    return {
      init,
      web3,
    };
  };

  const getMethod = (contract, name, params = null) => {
    return new Promise((resolve, reject) => {
      if (params) {
        contract.methods[name](params).send(
          { from: window.web3Obj.defaultAccount },
          (err, resp) => {
            if (err) reject(err);
            else resolve(resp);
          }
        );
      } else {
        contract.methods[name]().call(
          { from: window.web3Obj.defaultAccount },
          (err, resp) => {
            if (err) reject(err);
            else resolve(resp);
          }
        );
      }
    });
  };

  return {
    getMethod,
    useConnect,
  };
};

export default useWeb3;
