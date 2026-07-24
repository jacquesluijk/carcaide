// See https://kit.svelte.dev/docs/types#app
// e.g. import 'some-module' declare global {  namespace App {    // interface Error {}    // interface Locals {}    // interface PageData {}    // interface PageState {}    // interface Platform {}  } }

declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

export {};
