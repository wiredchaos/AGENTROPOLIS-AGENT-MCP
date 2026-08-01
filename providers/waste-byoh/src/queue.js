export class SerialQueue {
  #tail = Promise.resolve();
  #depth = 0;

  get depth() {
    return this.#depth;
  }

  run(fn) {
    this.#depth += 1;
    const task = this.#tail.then(fn, fn);
    this.#tail = task.catch(() => {}).finally(() => {
      this.#depth -= 1;
    });
    return task;
  }
}
