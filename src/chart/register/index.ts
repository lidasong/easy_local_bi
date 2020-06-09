class Register {
  registers: { [index: string]: any } = {};
  add(type: string, Chart: any) {
    const registers = this.registers;
    if (registers[type]) {
      throw new Error(`${type} has already been registered`);
    }
    registers[type] = Chart;
    return this;
  }

  get(type: string) {
    const registers = this.registers;
    const register = registers[type];
    if (!register) {
      throw new Error(`${type} has not been registered`);
    }
    return register;
  }

  remove(type: string) {
    const registers = this.registers;
    if (registers[type]) {
      delete registers[type];
    }
    return this;
  }
}

export default Register;
