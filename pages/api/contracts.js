// req = HTTP incoming message, res = HTTP server response
const {
  promises: { readdir, readFile },
} = require("fs");

const { exec } = require("child_process");

const getDirectories = async (source) =>
  (await readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const fetchArtifacts = async () => {
  const path = "./hardhat/artifacts/contracts/";
  const contractsFolder = await getDirectories(path);
  const artifacts = (
    await Promise.all(
      contractsFolder.map((item) => {
        const fileName = item.split("sol");
        return readFile(path + "" + item + "/" + fileName[0] + "json", "utf8");
      })
    )
  ).map((item) => JSON.parse(item));
  return artifacts;
};

const fetchAddresses = () => {
  return readFile("./contractsAdresses.json", "utf-8");
};

const compileAndDeploy = () => {
  return new Promise((resole, reject) => {
    exec("cd hardhat & npm run deploy", async (err, resp) => {
      if (err) reject(err);
      else {
        resole(fetchArtifacts());
      }
    });
  });
};

export default async function handler(req, res) {
  const { fetchOnly } = req.query;
  try {
    const addresses = await fetchAddresses();
    if (fetchOnly === "true") {
      res.status(200).json({ artifacts: await fetchArtifacts(), addresses });
    } else {
      res.status(200).json({ artifacts: await compileAndDeploy(), addresses });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
}
