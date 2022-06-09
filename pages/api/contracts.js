// req = HTTP incoming message, res = HTTP server response
const {
  promises: { readdir, readFile },
} = require("fs");

const getDirectories = async (source) =>
  (await readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

export default async function handler(req, res) {
  const path = "./hardhat/artifacts/contracts/";
  const contractsFolder = await getDirectories(path);
  const files = (await Promise.all(
    contractsFolder.map((item) => {
      const fileName = item.split("sol");
      return readFile(path + "" + item + "/" + fileName[0] + "json","utf8");
    })
  )).map((item)=> JSON.parse(item));
  res.status(200).json({ contracts: files });
}
