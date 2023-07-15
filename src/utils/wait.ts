import { sleep } from './sleep'

export async function wait(selector: () => boolean) {
  let bool = selector()

  while (!bool) {
    await sleep()
    bool = selector()
  }
}
