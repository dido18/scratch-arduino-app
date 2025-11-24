import { scratch, extension, type ExtensionMenuDisplayDetails, type BlockUtilityWithID, type Environment } from "$common";

const details: ExtensionMenuDisplayDetails = {
  name: "Arduino Modulino",
  description: "Control Arduino Modulino via scratch",
  iconURL: "Replace with the name of your icon image file (which should be placed in the same directory as this file)",
  insetIconURL: "Replace with the name of your inset icon image file (which should be placed in the same directory as this file)",
  tags :["Arduino UNO Q"]
};

export default class ExtensionNameGoesHere extends extension(details) {

  /** @see {ExplanationOfInitMethod} */
  init(env: Environment) {
  }

  /** @see {ExplanationOfExampleHatAndBlockUtility} */
  @(scratch.hat(function (_, tag) {
      return tag`When modulino button ${{ type: "string", options: ["A", "B", "C"]}} pressed`;
    }))
  async whenModulinoButtonsPressed(button: string, util: BlockUtilityWithID) {
    // return util.stackFrame.isLoop === condition;
    return true;
  }
}