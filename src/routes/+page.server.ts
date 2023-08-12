import db from "$lib/db"

export async function load() {
  // structuredClone since svelte expects plain object not mongo's _id: new ObjectId("...")
  const categories = structuredClone(await db.collection("admx").find({ parent: null }).toArray())
  
  return {
    categories
  }
}
