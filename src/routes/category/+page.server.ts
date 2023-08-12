import db from "$lib/db"
import { fail } from '@sveltejs/kit';

export async function load({ url }) {
  const namespace = url.searchParams.get('q')

  if (!namespace) {
    return fail(400, {
      error: true,
      message: "Namespace is required"
    })
  }

  // structuredClone since svelte expects plain object not mongo's _id: new ObjectId("...")
  // expanding the query will fail, unsure why
  // xml.policyDefinitions.policyNamespaces.target.@_namespace
  // const admx = structuredClone(await db.collection("admx").findOne({ namespace: namespace }))
  // const children = structuredClone(await db.collection("admx").findOne({ namespace: namespace }))

  // async function recursiveFind(namespace) {
  //   const children = await db.collection("admx").find({ parent: namespace }).toArray()

  //   const parent = await db.collection("admx").findOne({ namespace: namespace })
  //   if (children.length === 0) {
  //     return {
  //       policy,
  //       name: local[0].text || policy["@_name"],
  //       presentation: local[0].presentation,
  //       description: local[1].text, // eg Name_Help, Name_Explain
  //     }
  //   } else {
  //     const mapped = await Promise.all(children.map(async (child) => recursiveFind(child.namespace)))

  //     return {
  //       id: 
  //       text: 
  //       children: mapped
  //     }
  //   }
  // }

  // const admx = await recursiveFind(namespace)
  // const adml = structuredClone(await db.collection("adml").find({
  //   $text: { $search: namespace }
  // }))

  const admx = structuredClone(await db.collection("admx").aggregate([
    {
      $match: {
        namespace
      }
    },
    {
      $graphLookup: {
        from: "admx",
        startWith: "$namespace",
        connectFromField: "namespace",
        connectToField: "parent",
        as: "children"
      }
    }
  ]).toArray())

  async function getAdml(data) {
    // if (!data) {
    //   data = { id: 0, text: "No ADML", children: [] }
    //   return
    // }
    data.children?.forEach(async (child) => getAdml(child))
    const defs = data.xml
    const text = defs.policyNamespaces.target["@_namespace"]
    data.id = text
    data.text = text
    // { $not: /_/i }
    const singleton = Array.isArray(defs.policies.policy) ? defs.policies.policy : [defs.policies.policy]
    let children = await Promise.all(singleton.map(async (policy) => {
      let adml = structuredClone(await db.collection("adml").findOne({ namespace: data.namespace, id: policy["@_name"] })) || {}

      const $regex = new RegExp(`${policy["@_name"]}_.*`)
      adml.id = { ...adml, id: policy["@_name"], policy,
        description: structuredClone(await db.collection("adml").findOne({ namespace: data.namespace, id: { $regex } }))?.text
      }
      return adml
    }))
    children = children.reduce((acc, cur) => {
      const category = cur.id.policy.parentCategory["@_ref"]
      acc[category] = (acc[category] || []).concat(cur)
      return acc
    }, {})
    children = Object.keys(children).map((key) => {
      let category = children[key][0].id.policy.parentCategory["@_ref"].split(":")
      category = category[category.length - 1]
      return {
        id: category,
        text: category,
        children: children[key]
      }
    })
    data.children = await Promise.all((data.children || []).concat(children))
  }

  await getAdml(admx[0])
  
  // const adml = structuredClone(await db.collection("adml").find({ namespace: namespace }).toArray())
  
  return {
    admx,
    // adml
  }
}
