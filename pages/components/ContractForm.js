import { useState } from "react";
import { useForm } from "react-hook-form";
import useWeb3 from "./useWeb3";
import { toast } from "react-toastify";
import { Button, Input } from "./kit";

const useContractForm = () => {
  const { register, handleSubmit, reset } = useForm();
  const [formMap, setFormMap] = useState({});
  const [blocks, setBlocks] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  const { getMethod, useConnect } = useWeb3();
  const chectMutibility = (mut) => {
    return !(mut === "pure" || mut === "view");
  };

  const onSubmit = (data, event) => {
    const buttonClicked = event.nativeEvent.submitter.name;
    const functionType =
      event.nativeEvent.submitter.getAttribute("function-type");
    const isMutatible = functionType !== "pure" && functionType !== "view";
    const { contract, web3 } = window["web3Obj"];
    getMethod(contract, buttonClicked, data[buttonClicked])
      .then(async (resp) => {
        toast(
          `${buttonClicked} is executed successfully.!`,
          `Contract Function Success Call`
        );

        if (!isMutatible) {
          setFormMap({
            ...formMap,
            [buttonClicked]: resp,
          });
        }

        const earliest = await web3.eth.getBlock("earliest");
        const latest = await web3.eth.getBlock("latest");
        const blocksPromises = [];
        for (let b = earliest.number; b < latest.number; b++) {
          blocksPromises.push(web3.eth.getBlock(b));
        }

        const blcks = await Promise.all(blocksPromises);
        setBlocks(blcks);

        const trx = await Promise.all(
          blcks
            .flatMap((item) => item.transactions)
            .map((block) => web3.eth.getTransaction(block))
        );

        setAllTransactions(trx);

        if (isMutatible) {
          reset({
            [buttonClicked]: "",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const ContractForm = ({ abi }) => {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="m-auto max-w-3xl">
        <div className=" divide-y">
          {abi.map((item, i) => {
            if (item.name) {
              return (
                <div
                  className="flex m-auto py-2 gap-2 w-full"
                  key={i + item.name}
                >
                  <div className="w-1/3">
                    <Button
                      css="w-full"
                      variant={
                        chectMutibility(item.stateMutability)
                          ? "danger"
                          : "info"
                      }
                      function-type={item.stateMutability}
                      name={item.name}
                    >
                      {item.name}
                    </Button>
                  </div>

                  <div className="w-3/5 flex">
                    {item.outputs && item.outputs.length
                      ? item.outputs.map((output, j) => (
                          <Input
                            key={j}
                            disabled
                            placeholder={item.name}
                            name={item.name}
                            register={register}
                            value={formMap[item.name]}
                            css="w-full"
                          ></Input>
                        ))
                      : ""}

                    {item.inputs && item.inputs.length
                      ? item.inputs.map((inp, k) => (
                          <Input
                            key={k}
                            placeholder={item.name}
                            name={item.name}
                            value={formMap[item.name]}
                            register={register}
                            css="w-full"
                          ></Input>
                        ))
                      : ""}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </form>
    );
  };

  return {
    ContractForm,
    blocks,
    allTransactions,
    reset,
  };
};

export { useContractForm };
