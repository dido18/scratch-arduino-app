const path = require("path");
const fs = require("fs");

const extensions = [
  { name: "ArduinoBasics", directory: "arduino_basics" },
  { name: "ArduinoModulino", directory: "arduino_modulino" }
];

 // base dir is the 'scratch-arduino-extensions' folder
const BaseDir = path.resolve(__dirname, "../"); 

extensions.forEach(extension => {
  console.log(`\n${extension.name} (${extension.directory})`);

  process.stdout.write("\t - add symbolic link: ");
  const scratchVmExtensionsDir = path.resolve(BaseDir,"../scratch-editor/packages/scratch-vm/src/extensions",extension.directory);
  if (!fs.existsSync(scratchVmExtensionsDir)) {
    const patchedExtensionDir = path.resolve(BaseDir,"./packages/scratch-vm/src/extensions/",extension.directory);
    fs.symlinkSync(patchedExtensionDir, scratchVmExtensionsDir, "dir");
    process.stdout.write("done");
  } else  process.stdout.write("skip");
  

  process.stdout.write("\n\t - register builtin: ");
  const scratchVmExtensionsManagerFile = path.resolve(BaseDir, "../scratch-editor/packages/scratch-vm/src/extension-support/extension-manager.js");
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
  const scratchVmVirtualMachineFile = path.resolve(BaseDir, "../scratch-editor/packages/scratch-vm/src/virtual-machine.js");
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

process.stdout.write("\nAdding translation: ");
const scratchl10nEditorMsgsFile = path.resolve(BaseDir,"../scratch-editor/node_modules/scratch-l10n/locales/editor-msgs.js");
let fileContent = fs.readFileSync(scratchl10nEditorMsgsFile, "utf8");
let match = fileContent.match(/export default (\{.*\});/s);
if (!match) {
  throw new Error("Could not find object in file");
}
let obj = eval("(" + match[1] + ")");

const patchedMessages = path.resolve(BaseDir,"./scratch-l10n/locales/editor-msgs.json");
let messages = JSON.parse(fs.readFileSync(patchedMessages, "utf8"));
for (let lang in messages) {
  process.stdout.write(`\n\t - ${lang}`);
  obj[lang] = { ...obj[lang], ...messages[lang] };
}
let updatedContent = "export default " + JSON.stringify(obj, null, 2) + ";";
fs.writeFileSync(scratchl10nEditorMsgsFile, updatedContent);





