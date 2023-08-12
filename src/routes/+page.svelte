<script lang="ts">
  import { Content, UnorderedList, ListItem, Link } from "carbon-components-svelte";
  import "carbon-components-svelte/css/all.css";
  
  export let data: any
</script>

<Content>
  <h1>Select a category</h1>
  <UnorderedList>
    {#each data.categories as category}
      <ListItem>
        <Link href="/category?q={category.namespace}">{category.namespace}</Link>
      </ListItem>
    {/each}
  </UnorderedList>
</Content>
