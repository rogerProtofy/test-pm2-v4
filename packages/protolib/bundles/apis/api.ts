import { APIModel } from ".";
import { getSourceFile, addImportToSourceFile, ImportType, addObjectLiteralProperty, getDefinition, AutoAPI, getRoot, removeFileWithImports, addFeature, removeFeature, hasFeature } from '../../api'
import { promises as fs } from 'fs';
import * as fspath from 'path';
import { API } from 'protolib/base'
import { getServiceToken } from "../../api/lib/serviceToken";
import { Objects } from "app/bundles/objects";

const APIDir = (root) => fspath.join(root, "/packages/app/bundles/custom/apis/")
const indexFile = (root) => APIDir(root) + "index.ts"
const indexFilePath = "/packages/app/bundles/custom/apis/index.ts"

const getAPI = (apiPath, req) => {
  const sourceFile = getSourceFile(APIDir(getRoot(req)) + apiPath)
  const arg = getDefinition(sourceFile, '"type"')
  const obj = getDefinition(sourceFile, '"object"')
  return {
    name: apiPath.replace(/\.[^/.]+$/, ""), //remove extension
    type: arg ? arg.getText().replace(/^['"]+|['"]+$/g, '') : "Unknown",
    object: obj ? obj.getText().replace(/^['"]+|['"]+$/g, '') : "None"
  }
}

const getDB = (path, req, session) => {
  const db = {
    async *iterator() {
      const files = (await fs.readdir(APIDir(getRoot(req)))).filter(f => f != 'index.ts')
      const apis = await Promise.all(files.map(async f => getAPI(f, req)));

      for (const api of apis) {
        if (api) yield [api.name, JSON.stringify(api)];
      }
    },

    async put(key, value) {
      value = JSON.parse(value)

      if (value._deleted) {
        const api = getAPI(fspath.basename(value.name) + '.ts', req)
        removeFileWithImports(getRoot(req), value, '"apis"', indexFilePath, req);
        if (api.type === "AutoAPI") {
          const objectPath = fspath.join(getRoot(), Objects.object.getDefaultSchemaFilePath(api.object))
          let sourceFile = getSourceFile(objectPath)
          removeFeature(sourceFile, '"AutoAPI"')
        }
        return
      }

      const objectPath = fspath.join(getRoot(), Objects.object.getDefaultSchemaFilePath(value.object))
      let ObjectSourceFile = getSourceFile(objectPath)
      let exists
      const template = fspath.basename(value.template ?? 'empty')
      const filePath = getRoot(req) + 'packages/app/bundles/custom/apis/' + fspath.basename(value.name) + '.ts'

      try {
        await fs.access(filePath, fs.constants.F_OK)
        console.log('File: ' + filePath + ' already exists, not executing template')
        exists = true
      } catch (error) {
        exists = false
      }
      exists = hasFeature(ObjectSourceFile, '"AutoAPI"')
      
      if (exists) {
        console.log("AutoAPI already exists")
        return
      }
      
      const result = await API.post('/adminapi/v1/templates/file?token=' + getServiceToken(), {
        name: value.name + '.ts',
        data: {
          options: { template: `/packages/protolib/bundles/apis/templates/${template}.tpl`, variables: { name: value.name.charAt(0).toUpperCase() + value.name.slice(1), pluralName: value.name.endsWith('s') ? value.name : value.name + 's', object: value.object } },
          path: '/packages/app/bundles/custom/apis'
        }
      })

      if (result.isError) {
        throw result.error
      }

      //add autoapi feature in object if needed
      if (value.object && template.startsWith("Automatic CRUD")) {
        console.log('Adding feature AutoAPI to object: ', value.object)
        await addFeature(ObjectSourceFile, '"AutoAPI"', "true")
      }
      //link in index.ts
      const sourceFile = getSourceFile(indexFile(getRoot(req)))
      addImportToSourceFile(sourceFile, value.name + 'Api', ImportType.DEFAULT, './' + value.name)

      const arg = getDefinition(sourceFile, '"apis"')
      if (!arg) {
        throw "No link definition schema marker found for file: " + path
      }
      addObjectLiteralProperty(arg, value.name, value.name + 'Api')
      sourceFile.saveSync();
    },

    async get(key) {
      return JSON.stringify({ name: key })
    }
  };

  return db;
}

export const APIsAPI = AutoAPI({
  modelName: 'apis',
  modelType: APIModel,
  initialDataDir: __dirname,
  prefix: '/adminapi/v1/',
  getDB: getDB,
  requiresAdmin: ['*']
})