import * as Phaser from "phaser";
import { generateTextures } from "../fx/textures";
import { SCENE } from "../keys";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE.boot);
  }

  create() {
    generateTextures(this);
    this.scene.start(SCENE.menu);
  }
}
