<script lang="ts">
  import { Header, SkipToContent, HeaderUtilities, HeaderSearch, 
    Content, Grid, Row, Column, TreeView, Theme, HeaderGlobalAction, Toggle, Tile } from "carbon-components-svelte";
  import "carbon-components-svelte/css/all.css";
  import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
  import {
    StructuredList,
    StructuredListHead,
    StructuredListRow,
    StructuredListCell,
    StructuredListBody,
  } from "carbon-components-svelte";

  let theme = "black";

  export let data: any

  // const policies = data.admx?.xml.policyDefinitions.policies.policy
  // const localised = policies.map(policy => {
  //   const local = data?.adml.filter(adml => adml.id.startsWith(policy["@_name"]))

  //   return {
  //     policy,
  //     name: local[0].text || policy["@_name"],
  //     presentation: local[0].presentation,
  //     description: local[1].text, // eg Name_Help, Name_Explain
  //   }
  // })

  const policyTree = [data.admx[0]]

  const supportedOnDisplayNames = {
    "windows:SUPPORTED_Windows_10_0_RS2": "At least Windows Server 2016, Windows 10 Version 1703",
    "windows:SUPPORTED_Win2k": "At least Windows 2000",
    "windows:SUPPORTED_WindowsXP": "At least Windows Server 2003 operating systems or Windows XP Professional",
    "windows:SUPPORTED_Windows_10_0_RS3": "At least Windows Server, Windows 10 Version 1709"
  }
  $: supportedOnId = activeId?.policy?.supportedOn?.["@_ref"]
  $: supportedOnDisplayName = supportedOnId ? supportedOnDisplayNames[supportedOnId] || supportedOnId : ''
  
  const registryHiveDisplayNames = {
    "Machine": "HKEY_LOCAL_MACHINE",
    "User": "HKEY_CURRENT_USER",
    "Both": "HKEY_LOCAL_MACHINE or HKEY_CURRENT_USER",
    "default": "unknown"
  }
  $: registryHive = registryHiveDisplayNames[activeId?.policy?.["@_class"] || "default"] 

  let activeId = null;
  let selectedIds: string[] = [];


  let ref = null;
  let active = false;
  let selectedResultIndex = 0;
  let events = [];
  let value = "";
  $: lowerCaseValue = value.toLowerCase();
  // const searchable = data.adml?.map(s => ({
  //   text: s["@_id"],
  //   description: s["#text"]
  // }))
  $: results = [].length > 0
      ? [].filter((item) => {
          return (
            item.description.toLowerCase().includes(lowerCaseValue) ||
            item.text.includes(lowerCaseValue)
          );
        })
      : [];
</script>


<Theme bind:theme persist persistKey="__carbon-theme" />

<Header platformName="ADMX Help" href="/">
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderUtilities>
    <HeaderSearch
      bind:ref
      bind:active
      bind:value
      bind:selectedResultIndex
      placeholder="Search policies"
      {results}
    />
    <!-- <Theme bind:theme persist persistKey="__carbon-theme" render="toggle" toggle={{
      themes: ["g10", "g80"],
      labelA: "Light",
      labelB: "Dark",
      hideLabel: true,
      size: "sm",
    }} />
    <HeaderGlobalAction aria-label="Settings" icon={SettingsAdjust}  /> -->
  </HeaderUtilities>
</Header>

<Content>
  <Grid>
    <Row>
      <!-- on:select={({ detail }) => console.log("select", detail)} -->
      <!-- labelText="Policies" -->
      <TreeView
        children={policyTree}
        style="width: 100%"
        bind:activeId
        bind:selectedIds
        on:select={({ detail }) => console.log("select", activeId)}
        on:toggle={({ detail }) => console.log("toggle", detail)}
        on:focus={({ detail }) => console.log("focus", detail)}
      />
    </Row>
    <Row>
      <Column style="white-space: pre-line">
        <br/>
        <h3>{activeId?.text || ''}</h3>
        <br/>
        {activeId?.description || ''}
        <!-- {body.find(s => s["@_id"].endsWith("_Help"))?.["#text"]} -->
        <br/>
        <br/>
        {#if supportedOnDisplayName}
          <Tile>Supported on: {supportedOnDisplayName}</Tile>
        {/if}
      </Column>
    </Row>
    <Row>
      <Column>
        {#if activeId?.policy}
        <StructuredList>
          <StructuredListBody>
            <StructuredListRow>
              <StructuredListCell noWrap>Registry Hive</StructuredListCell>
              <StructuredListCell>{registryHive}</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
              <StructuredListCell noWrap>Registry Path</StructuredListCell>
              <StructuredListCell>{activeId?.policy["@_key"] || ''}</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
              <StructuredListCell noWrap>Value Name</StructuredListCell>
              <StructuredListCell>{activeId?.id}</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
              <StructuredListCell noWrap>Value Type</StructuredListCell>
              <StructuredListCell>REG_DWORD</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
              <StructuredListCell noWrap>Enabled Value</StructuredListCell>
              <StructuredListCell>1</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
              <StructuredListCell noWrap>Disabled Value</StructuredListCell>
              <StructuredListCell>0</StructuredListCell>
            </StructuredListRow>
            {#if activeId?.presentation?.listBox}
              <StructuredListRow>
                <StructuredListCell noWrap>{activeId.presentation.listBox["#text"]}</StructuredListCell>
                <StructuredListCell>{activeId?.policy.elements.list["@_key"]}</StructuredListCell>
              </StructuredListRow>
              <StructuredListRow>
                <StructuredListCell noWrap>Value Type</StructuredListCell>
                <StructuredListCell>REG_SZ</StructuredListCell>
              </StructuredListRow>
            {/if}
            {#if activeId?.presentation?.textBox}
              <StructuredListRow>
                <StructuredListCell noWrap>{activeId.presentation.textBox.label}</StructuredListCell>
                <StructuredListCell>{activeId.policy.elements?.text["@_valueName"] || ''}</StructuredListCell>
              </StructuredListRow>
            {/if}
          </StructuredListBody>
        </StructuredList>
        {/if}
      </Column>
    </Row>
  </Grid>
</Content>
