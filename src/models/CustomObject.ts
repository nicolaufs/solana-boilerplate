import * as borsh from '@project-serum/borsh';

export class CustomObject {
  param1: string;
  param2: number;
  param3: string;

  constructor(param1: string, param2: number, param3: string) {
    this.param1 = param1;
    this.param2 = param2;
    this.param3 = param3;
  }

  static mocks: CustomObject[] = [
    new CustomObject('Custom Object 1 param 1', 1, `Custom Object 1 param 3`),
    new CustomObject('Custom Object 2 param 1', 2, `Custom Object 2 param 3`),
    new CustomObject('Custom Object 3 param 1', 3, `Custom Object 3 param 3`),
    new CustomObject('Custom Object 4 param 1', 4, `Custom Object 4 param 3`),
    new CustomObject('Custom Object 5 param 1', 5, `Custom Object 5 param 3`),
  ];

  borshInstructionSchema = borsh.struct([
    borsh.u8('variant'),
    borsh.str('param1'),
    borsh.u8('param2'),
    borsh.str('param3'),
  ]);

  static borshAccountSchema = borsh.struct([
    // account state received like this, so fixed size params are first, string latest
    borsh.bool('initialized'),
    borsh.u8('param2'),
    borsh.str('param1'),
    borsh.str('param3'),
  ]);

  serialize(): Buffer {
    const buffer = Buffer.alloc(1000);
    this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
    return buffer.subarray(0, this.borshInstructionSchema.getSpan(buffer));
  }

  static deserialize(buffer?: Buffer): CustomObject | null {
    if (!buffer) {
      return null;
    }

    try {
      const { param1, param2, param3 } = this.borshAccountSchema.decode(buffer);
      return new CustomObject(param1, param2, param3);
    } catch (e) {
      console.log('Deserialization error:', e);
      return null;
    }
  }
}
