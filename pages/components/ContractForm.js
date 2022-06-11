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

  const onSubmit = (data, event) => {
    const buttonClicked = event.nativeEvent.submitter.name;
    console.dir(event.nativeEvent.submitter);
    const functionType =
      event.nativeEvent.submitter.getAttribute("function-type");
    const { contract, web3 } = window["web3Obj"];
    getMethod(contract, buttonClicked, data[buttonClicked])
      .then(async (resp) => {
        toast(
          `${buttonClicked} is executed successfully.!`,
          `Contract Function Success Call`
        );
        setFormMap({
          ...formMap,
          [buttonClicked]: resp,
        });

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

        if (functionType !== "pure" && functionType !== "view") {
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
      <form onSubmit={handleSubmit(onSubmit)} className="m-auto">
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
                      function-type={item.stateMutability}
                      name={item.name}
                    >
                      {item.name}
                    </Button>
                  </div>

                  <div className="w-2/3 flex">
                    {item.outputs && item.outputs.length
                      ? item.outputs.map((output, j) => (
                          <Input
                            key={j}
                            disabled
                            placeholder={item.name}
                            name={item.name}
                            register={register}
                            value={formMap[item.name]}
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
  };
};

export { useContractForm };
