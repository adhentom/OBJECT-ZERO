import * as Phaser from "phaser";

// Bootstrap placeholder; replaced by the real menu in milestone 1.
export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create() {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2 - 20, "OBJECT ZERO", { fontFamily: "monospace", fontSize: "64px", color: "#3df2ff" })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 40, "Reality Is Your Arsenal.", { fontFamily: "monospace", fontSize: "22px", color: "#ff3fd1" })
      .setOrigin(0.5);
  }
}
