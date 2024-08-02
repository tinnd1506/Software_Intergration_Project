import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],

}

export default config
