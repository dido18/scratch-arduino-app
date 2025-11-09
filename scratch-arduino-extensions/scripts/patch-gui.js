const path = require("path");
const fs = require("fs");

const extensions = [
  { name: "ArduinoBasics", directory: "arduino_basics" },
  { name: "ArduinoModulino", directory: "arduino_modulino" },
  { name: "ArduinoObjectDetection", directory: "arduino_object_detection" },
  { name: "ArduinoImageClassification", directory: "arduino_image_classification" },
];

// base dir is the 'scratch-arduino-extensions' folder
const BaseDir = path.resolve(__dirname, "../");

extensions.forEach(extension => {
  console.log(`\n${extension.name} (${extension.directory})`);

  process.stdout.write("\t - add symbolic link: ");
  const scratchVmExtensionsDir = path.resolve(
    BaseDir,
    "../scratch-editor/packages/scratch-vm/src/extensions",
    extension.directory,
  );
  if (!fs.existsSync(scratchVmExtensionsDir)) {
    const patchedExtensionDir = path.resolve(BaseDir, "./packages/scratch-vm/src/extensions/", extension.directory);
    fs.symlinkSync(patchedExtensionDir, scratchVmExtensionsDir, "dir");
    process.stdout.write("done");
  } else process.stdout.write("skip");

  process.stdout.write("\n\t - register builtin: ");
  const scratchVmExtensionsManagerFile = path.resolve(
    BaseDir,
    "../scratch-editor/packages/scratch-vm/src/extension-support/extension-manager.js",
  );
  let managerCode = fs.readFileSync(scratchVmExtensionsManagerFile, "utf-8");
  if (!managerCode.includes(extension.name)) {
    fs.copyFileSync(scratchVmExtensionsManagerFile, `${scratchVmExtensionsManagerFile}.orig`);
    managerCode = managerCode.replace(
      /builtinExtensions = {[\s\S]*?};/,
      `$&\n\nbuiltinExtensions.${extension.name} = () => require('../extensions/${extension.directory}');`,
    );
    fs.writeFileSync(scratchVmExtensionsManagerFile, managerCode);
    process.stdout.write("done");
  } else process.stdout.write("skip");

  process.stdout.write("\n\t - register core: ");
  const scratchVmVirtualMachineFile = path.resolve(
    BaseDir,
    "../scratch-editor/packages/scratch-vm/src/virtual-machine.js",
  );
  let vmCode = fs.readFileSync(scratchVmVirtualMachineFile, "utf-8");
  if (!vmCode.includes(extension.name)) {
    fs.copyFileSync(scratchVmVirtualMachineFile, `${scratchVmVirtualMachineFile}.orig`);
    vmCode = vmCode.replace(
      /(CORE_EXTENSIONS = \[[\s\S]*?)\];/,
      `$1'${extension.name}',\n];`,
    );
    fs.writeFileSync(scratchVmVirtualMachineFile, vmCode);
    process.stdout.write("done\n");
  } else process.stdout.write("skip");
});
