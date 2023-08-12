<script lang="ts">
  import { enhance } from '$app/forms';
  import { Content, FormGroup, FileUploaderButton, Button, TextInput, InlineLoading } from "carbon-components-svelte";
  import "carbon-components-svelte/css/all.css";

  export let form;
</script>

<Content>
  <form method="post" use:enhance enctype="multipart/form-data">
    <FormGroup>
      <h1>Upload</h1>
    </FormGroup>
    <FormGroup>
      <TextInput name="language" labelText="Language (ADML files)" value="en-US" invalid={form?.error} invalidText={form?.message}/>
    </FormGroup>
    <FormGroup>
      <FileUploaderButton
        name="files"
        accept={['.admx', '.adml']}
        labelText="Add files"
        multiple
        required
      />
    </FormGroup>
    <Button type="submit">Submit</Button>
    {#if form}
      <InlineLoading status={form.error === false ? "finished" : "active"} description={form.message}/>
    {/if}
  </form>
</Content>
