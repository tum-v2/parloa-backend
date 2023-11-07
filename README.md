<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
<h3 align="center">Javascript Technology: Parloa (Backend)</h3>

  <p align="center">
  This project is centered around the development of a goal-driven, self-improving Language Learning Model (LLM) bot. The bot interacts with mock APIs and should be capable of navigating a variety of different conversation scenarios (see FR3). A primary objective is to enable the bot to autonomously achieve predefined goals through continuous self-improvement and optimization. Comparative studies will be carried out to determine the performance efficacy of different LLMs, such as Llama2 and GPT-4, in achieving these goals.
    <br />
    <br />
    <a href="https://github.com/tum-v2/parloa-backend">View Demo</a>
    ·
    <a href="https://github.com/tum-v2/parloa-backend/issues">Report Bug</a>
    ·
    <a href="https://github.com/tum-v2/parloa-backend/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#directory-structure">Directory Structure</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#available-scripts">Available Scripts</a></li>
      </ul>
    </li>
    <li>
      <a href="#formatting">Formatting</a></li>
      <ul>
        <li><a href="#eslint">Eslint</a></li>
        <li><a href="#prettier">Prettier</a></li>
        <li><a href="#husky--lint-staged">Husky & lint-staged</a></li>
        <li><a href="#branch-structure">Branch Structure</a></li>
      </ul>
    <li><a href="#documentation--comments">Documentation & Comments</a></li>
    <li><a href="#contributing">Contributing</a></li>
     <ul>
        <li><a href="#commits">Commits</a></li>
        <li><a href="#pull-requests">Pull Requests</a></li>
      </ul>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->

## About The Project

This is a Node.js project built in TypeScript.

- [![Typescript][Typescript]][Typescript-url]: The project is written in TypeScript, providing strong typing and
  improved code quality.
- [![Express][Express]][Express-url]: Utilizes the Express.js framework for building web applications.
- [![MongoDB][Mongodb]][Mongodb-url] [![Mongoose][Mongoose]][Mongoose-url]: Demonstrates how to work with MongoDB using
  the Mongoose ODM.
- [![Azure Cosmos DB][Azurecosmosdb]][Azurecosmosdb-url]: Includes Azure Cosmos support for scalable and globally
  distributed database.
- [![ESLint][Eslint]][Eslint-url] [![Prettier][Prettier]][Prettier-url]: Enforces code quality and style with ESLint and
  Prettier.
- [![Nodemon][Nodemon]][Nodemon-url]: Auto-reloads the server during development for a seamless development experience.
- [![Husky][Husky]][Husky-url]: Enforces code quality and formatting checks as part of the development workflow.
- [![TSDoc][Tsdoc]][Tsdoc-url]: Utilizes TSDoc to generate meaningful API documentation for TypeScript code.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Directory Structure

- src: Contains the source code for your application.
- build: Stores the compiled TypeScript code.
- node_modules: Contains project dependencies.
- package.json: Defines project metadata and scripts.
- tsconfig.json: TypeScript configuration file.
- .eslintrc.json: ESLint configuration file.
- .prettierrc: Prettier configuration file.
- lint-staged.config.js: Configuration for lint-staged and Husky.

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/tum-v2/parloa-backend.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
   This will install all the dependencies listed in package.json.

3. Start the development server with Nodemon:
   ```sh
   npm run start:dev
   ```
   You will be able to see the changes made to code dynamically.
4. Open your web browser and access the application at http://localhost:3000 (or the configured port).

You can also build the application and compile the typescript code without starting the development server, just run:

   ```sh
   npm run start
   ```

### Available Scripts

* **npm run lint**: Run ESLint to check for code quality issues.
* **npm run format**: Run ESLint with the --fix option to automatically fix code style issues.
* **npm run build**: Clean the build directory and compile TypeScript files.
* **npm start**: Build the project and start the server.
* **npm test**: Runs all the unit tests in the __tests__ folder.
* **npm run prepare**: Install Husky hooks during project setup.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Formatting

The project uses ESLint and prettier to lint and format code.

Please note that whenever you push some changes to a branch, ESLint and prettier will run automatically, via Github
Actions.

### ESLint

- To change the ESLing configuration, see [here](https://eslint.org/docs/latest/use/configure/).

You can run ESLint manually by:

```bash
npm run lint
```

You can also integrate ESLint with your IDE:

- For WebStorm, follow the
  instructions [here](https://www.jetbrains.com/help/webstorm/eslint.html#ws_js_eslint_automatic_configuration).
- For VSCode, follow the instructions [here](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### prettier

There is already a `.prettierrc` file available in the repository.

prettier can also be integrated with your IDE:

- For Webstorm, follow the instructions [here](https://prettier.io/docs/en/webstorm).
- For VSCode, follow the instructions [here](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Husky & lint-staged

Husky is a tool to enable hooks for projects.

Husky will run a `pre-commit` hook that calls `ESLint` and `prettier` before every commit. If it encounters errors or
warnings, the commit will fail.

If you encounter a warning that is inconsequential or simply a bug that does not affect the production code, you can
disable the `pre-commit` hook by running:

```Bash
git commit --no-verify
# and
git push --no-verify
```

The `--no-verify` flag should disable Husky. Please use this only carefully and only on warnings that does not make
sense.

### Branch Structure

- Please **don't** merge your branches directly with the `main` branch. There is a `development` branch which you can
  merge your branches.
- The new branch should be branched off of the `development` branch
- This will allow for a stable `main` branch in case anything goes wrong with the integration.
- Development can be merged to main when everybody gives the green light, possible at the end of every sprint.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Testing

### Jest

For unit testing and for integration testing, we will use [Jest](https://jestjs.io/) library.

Jest will automatically run every test in the `__tests__` file when you run:

```bash
npm run test
```

If you want to run a single test, you can run:

```bash
npm run test -t "my-test-name"
```

Jest will only run tests that match the test name pattern you provide. Learn more in
the [documentation](https://jestjs.io/docs/cli#--testnamepatternregex).

You can also use Jest's `watch mode` by running:

```bash
npm run test:watch
```

This will run Jest in watch mode, where you can watch files for changes and rerun tests related to changed files. For
more detailed information, check the [documentation](https://jestjs.io/docs/cli#--watch).

In order for Jest to compile TypeScript code, we are using ``ts-jest``.
See [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/docs/getting-started/installation) for more
information. The necessary configuration should already be defined in ``jest.config.js``.

For more information about Jest configuration,
see [here](https://jestjs.io/docs/getting-started#additional-configuration).

A common approach to naming tests is to name the test as the same name as the component you are testing, followed by
a ``.test.ts``.

## Documentation & Comments

In order to write consistent doc comments, we will use [TSDoc](https://tsdoc.org/).

We are using `eslint-plugin-tsdoc` to integrate TSDoc with ESLint. This way, ESLint will issue a warning when the doc
comments are not in TSDoc standards.

To learn more about `eslint-plugin-tsdoc`, check [here](https://www.npmjs.com/package/eslint-plugin-tsdoc).


<!-- CONTRIBUTING -->

## Contributing

All changes must be developed on a new branch. Unless otherwise stated, the new branch should be branched off of the
development branch.

**Branch Naming:** Use Linear’s branch name feature!

1. Go to your task’s detail page
2. Click on the branch icon at the top right of the page to copy the branch’s name
3. Use that name to create a new branch in your local git repository (`git checkout -b <branch_name>`)
4. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the Branch (`git push origin <branch_name>`)
6. Open a Pull Request

### Commits

**Descriptive Commit Messages**: Please provide short but descriptive commit messages for other developers to
understand.

### Pull Requests

**Describe your PR with as much detail as possible**

- What changes have you made? (Why?)
- Specify any important decisions you made that involve other teams
- Add screenshots to visualize your changes

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/tum-v2/parloa-backend.svg?style=for-the-badge

[contributors-url]: https://github.com/tum-v2/parloa-backend/graphs/contributors

[stars-shield]: https://img.shields.io/github/stars/tum-v2/parloa-backend.svg?style=for-the-badge

[stars-url]: https://github.com/tum-v2/parloa-backend/stargazers

[issues-shield]: https://img.shields.io/github/issues/tum-v2/parloa-backend.svg?style=for-the-badge

[issues-url]: https://github.com/tum-v2/parloa-backend/issues

[Typescript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white

[Typescript-url]: https://www.typescriptlang.org/docs/

[Express]: https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express

[Express-url]: https://expressjs.com/

[Mongodb]: https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white

[Mongodb-url]: https://www.mongodb.com/

[Mongoose]: https://img.shields.io/badge/mongoose-000000?style=for-the-badge&logo=mongoose

[Mongoose-url]: https://mongoosejs.com/docs/guide.html

[Azurecosmosdb]: https://img.shields.io/badge/azurecosmosdb-000000?style=for-the-badge&logo=azurecosmosdb

[Azurecosmosdb-url]: https://learn.microsoft.com/en-us/azure/cosmos-db/introduction

[Eslint]: https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white

[Eslint-url]: https://eslint.org/

[Prettier]: https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E

[Prettier-url]: https://prettier.io/

[Nodemon]: https://img.shields.io/badge/nodemon-000000?style=for-the-badge&logo=nodemon

[Nodemon-url]: https://www.npmjs.com/package/nodemon

[Husky]: https://img.shields.io/badge/husky-000000?style=for-the-badge&logo=husky

[Husky-url]: https://typicode.github.io/husky/getting-started.html

[Tsdoc]: https://img.shields.io/badge/tsdoc-000000?style=for-the-badge&logo=tsdoc

[Tsdoc-url]: https://tsdoc.org/


