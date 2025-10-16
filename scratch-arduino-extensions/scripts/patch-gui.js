const path = require("path");
const fs = require("fs");

const BaseDir = path.resolve(__dirname, "../"); // base dir is the 'scratch-arduino-extensions'

const ScratchVmExtensionsManagerFile = path.resolve(
  BaseDir,
  "../scratch-editor/packages/scratch-vm/src/extension-support/extension-manager.js"
);

const ScratchVmVirtualMachineFile = path.resolve(
  BaseDir,
  "../scratch-editor/packages/scratch-vm/src/virtual-machine.js",
);

// const VmExtArduinoDir = path.resolve(
//   GuiDir,
//   "./node_modules/scratch-vm/src/extensions/",
//   ExtDirName,
// );
// const EditorMessagesDir = path.resolve(
//   GuiDir,
//   "./node_modules/scratch-l10n/locales/editor-msgs.js",
// );
// const IncludeMessagesPathFile = path.resolve(
//   BaseDir,
//   "./scratch-l10n/locales/include-msgs.json",
// );

const ExtIds = ["Scratch3Arduino"];
const ExtDirName = "scratch3_arduino";

const PatchedExtensionDir = path.resolve(
  BaseDir,
  "./packages/scratch-vm/src/extensions/",
  ExtDirName,
);
const ScratchVmExtensionsDir = path.resolve(
  BaseDir,
  "../scratch-editor/packages/scratch-vm/src/extensions",
   ExtDirName,
);

if (!fs.existsSync(ScratchVmExtensionsDir)) {
  fs.symlinkSync(PatchedExtensionDir, ScratchVmExtensionsDir, "dir");
  console.log("Set symbolic link to", ScratchVmExtensionsDir);
} else {
  console.log("Symbolic link already set to", ScratchVmExtensionsDir);
}

let managerCode = fs.readFileSync(ScratchVmExtensionsManagerFile, "utf-8");
for (const ExtId of ExtIds) {
  if (managerCode.includes(ExtId)) {
    console.log(`Already registered in manager: ${ExtId}`);
  } else {
    fs.copyFileSync(ScratchVmExtensionsManagerFile, `${ScratchVmExtensionsManagerFile}.orig`);
    managerCode = managerCode.replace(
      /builtinExtensions = {[\s\S]*?};/,
      `$&\n\nbuiltinExtensions.${ExtId} = () => require('../extensions/${ExtDirName}');`,
    );
    fs.writeFileSync(ScratchVmExtensionsManagerFile, managerCode);
    console.log(`Registered in manager: ${ExtId}`);
  }
}


// Add the extension as a core extension.
let vmCode = fs.readFileSync(ScratchVmVirtualMachineFile, "utf-8");
for (const ExtId of ExtIds) {
  if (vmCode.includes(ExtId)) {
    console.log(`Already added as a core extension: ${ExtId}`);
  } else {
    fs.copyFileSync(ScratchVmVirtualMachineFile, `${ScratchVmVirtualMachineFile}.orig`);
    vmCode = vmCode.replace(
      /CORE_EXTENSIONS = \[[\s\S]*?\];/,
      `$&\n\nCORE_EXTENSIONS.push('${ExtId}');`,
    );
    fs.writeFileSync(ScratchVmVirtualMachineFile, vmCode);
    console.log(`Add as a core extension: ${ExtId}`);
  }
}

console.log(ScratchVmVirtualMachineFile);
process.exit();


// read the editor messages file and include the messages from the include-msgs.json file
let fileContent = fs.readFileSync(EditorMessagesDir, "utf8");
let match = fileContent.match(/export default (\{.*\});/s);
if (!match) {
  throw new Error("Could not find object in file");
}
let obj = eval("(" + match[1] + ")");

let includeMsgs = JSON.parse(fs.readFileSync(IncludeMessagesPathFile, "utf8"));
for (let lang in includeMsgs) {
  console.log(`Adding "${lang}" translation`);
  obj[lang] = { ...obj[lang], ...includeMsgs[lang] };
}
let updatedContent = "export default " + JSON.stringify(obj, null, 2) + ";";
fs.writeFileSync(EditorMessagesDir, updatedContent);
