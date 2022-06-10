// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {
  promises: { readdir, readFile, writeFile },
} = require("fs");

const compileAndDeployAllContracts = async () => {
  try {
    const contractsFileNames = (await readdir("./../contracts")).map(
      (item) => item.split(".sol")[0]
    );

    console.log("Compiling...");
    await hre.run("compile");
    const cFactoryPromiseList = contractsFileNames.map((item) =>
      hre.ethers.getContractFactory(item)
    );

    console.log("Deploying...");
    const contractList = await Promise.all(cFactoryPromiseList);
    const deployableContracts = await Promise.all(
      contractList.map((item) => item.deploy("Some text here"))
    );

    await Promise.all(deployableContracts.map((item) => item.deployed()));
    const adresses = deployableContracts.map((item) => item.address);
    console.log(
      `Deployed ${
        deployableContracts.length
      } contracts: ${contractsFileNames.join(",")}`
    );
    writeFile(
      "./../../contractsAdresses.json",
      adresses,
      "utf8",
      (err, resp) => {
        if (err) console.error(err);
        else console.log(resp);
      }
    );
  } catch (error) {
    console.error(error);
  }
};

compileAndDeployAllContracts();
