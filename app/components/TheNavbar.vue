<template>
  <header
    class="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl"
  >
    <nav
      class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-6 sm:px-8"
      aria-label="Navigation principale"
    >
      <NuxtLink
        to="/"
        class="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-[1.04]"
          aria-hidden="true"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4c-2.2 3.4-6 5.6-6 9.4A6 6 0 0 0 12 20a6 6 0 0 0 6-6.6C18 9.6 14.2 7.4 12 4Z" />
          </svg>
        </span>
        <span class="font-serif text-lg font-semibold tracking-tight text-foreground">
          SportMeal
        </span>
      </NuxtLink>

      <div class="flex items-center gap-1 sm:gap-2">
        <NavbarAuthMenu />
        <NavbarThemeToggle />
      </div>
    </nav>
  </header>
</template>
