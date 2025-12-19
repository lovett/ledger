# Angular

The browser UI of Ledger uses [Angular v21](https://angular.dev/overview).

Interaction with Angular's `ng` is wrapped by a mix task of the same name. A similar approach is used for `biome`.

Aliases in `mix.exs` are available for common tasks.

## Development server

To start a local development server, go to the repository root and run:

```bash
mix phx.server
```

The application is served on `http://localhost:4002` and will automatically reload when Angular files are modified.

## Code scaffolding
All interaction with `ng` should happen at the repository root through `mix`. See the aliases in `mix.exs` and the custom task in `lib/mix/tasks/angular/ng.ex`

To generate a new component, run:

```bash
mix ng.ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
mix ng.ng generate --help
```

## Building

To build the project, run:

```bash
mix ng.build
```

Build artifacts will be placed in `priv/angular/browser`.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
mix ng.test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
mix ng.e2e
```

## Resources
  - [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
