import { fail, text } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';

import db from "$lib/db"

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData()

    // TODO additional input validation?
    if (!formData.has("files")) {
      return fail(400, {
        error: true,
        message: "Files are required"
      })
    }

    if (!formData.has("language")) {
      return fail(400, {
        error: true,
        message: "Language is required"
      })
    }
    
    const language = formData.get("language") as string
    // https://www.mongodb.com/docs/manual/reference/text-search-languages/
    const isoLanguage = language.split("-")[0]
    const parser = new XMLParser({ ignoreAttributes : false });

    let admx = []
    let adml = []
    for (const file of formData.getAll("files") as File[]) {
      const namespace = file.name.substring(0, file.name.lastIndexOf("."))

      if (file.name.endsWith(".admx")) {
        const xml = parser.parse(await file.text()).policyDefinitions
        const category = xml?.categories?.category || xml?.categories?.category[0]
        const parent = category?.parentCategory?.["@_ref"].split(":")

        admx.push({
          parent: parent?.[parent.length-1],
          namespace,
          xml
        })

      } else if (file.name.endsWith(".adml")) {
        const xml = parser.parse(await file.text())
        let strings = xml.policyDefinitionResources?.resources.stringTable.string || []
        const presentations = xml.policyDefinitionResources?.resources.presentationTable?.presentation

        for (const row of strings) {
          adml.push({
            namespace,
            language: isoLanguage,
            id: row["@_id"],
            text: row["#text"],
            presentation: Array.isArray(presentations) ? presentations.find(e => e["@_id"] === row["@_id"]) : presentations
          })
        }
      }
    }
    
    await Promise.all([
      admx.length && db.collection("admx").insertMany(admx),
      adml.length && db.collection("adml").insertMany(adml)
    ])

    if (!await db.collection("adml").indexExists("text")) {
      // text property has type of text. can only index strings or string arrays, so we have to parse json
      await db.collection("adml").createIndex({ "text": "text" })
    }

    return {
      error: false,
      message: "Files uploaded"
    };
  }
};