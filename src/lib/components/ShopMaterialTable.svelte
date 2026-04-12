<script lang="ts">
  interface ShopMaterialRow {
    type: string;
    name: string;
    cost: number;
    isUnlocked: boolean;
    canAfford: boolean;
    canPurchase: boolean;
    blockedReason: string | null;
  }

  export let materials: readonly ShopMaterialRow[] = [];
</script>

<table>
  <caption>Current material availability</caption>
  <thead>
    <tr>
      <th scope="col">Material</th>
      <th scope="col">Cost</th>
      <th scope="col">Unlocked</th>
      <th scope="col">Can Afford</th>
      <th scope="col">Can Purchase</th>
      <th scope="col">Blocked Reason</th>
    </tr>
  </thead>
  <tbody>
    {#each materials as material}
      <tr>
        <th scope="row">{material.name}</th>
        <td>{material.cost}</td>
        <td>{material.isUnlocked ? 'Yes' : 'No'}</td>
        <td>{material.canAfford ? 'Yes' : 'No'}</td>
        <td>{material.canPurchase ? 'Yes' : 'No'}</td>
        <td>{material.blockedReason ?? 'none'}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }

  caption {
    font-weight: 600;
    margin-bottom: 0.75rem;
    text-align: left;
  }

  th,
  td {
    border: 1px solid #d1d5db;
    padding: 0.5rem 0.75rem;
    text-align: left;
    vertical-align: top;
  }

  thead th {
    background: #f3f4f6;
  }
</style>
