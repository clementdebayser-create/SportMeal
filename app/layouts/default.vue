<template>
  <div class="default-layout min-h-screen flex flex-col bg-background">
    <TheNavbar />
    <main class="flex-auto">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>
