<script lang="ts">
  export let name: string;
  export let size = 24;
  export let className = '';
</script>

<svg
  class={className}
  width={size}
  height={size}
  aria-hidden="true"
  focusable="false"
  role="img"
>
  <use href={`/icons/sprite.svg#icon-${name}`} />
</svg>
