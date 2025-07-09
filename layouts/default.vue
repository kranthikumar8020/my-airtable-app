<template>
    <div>
      <div v-if="$route.path !== '/'" class="back-button-wrapper">
        <NuxtLink to="/" class="back-button">← Back to Main Page</NuxtLink>
      </div>
  
      <NuxtPage />
    </div>
  </template>
  
  <style scoped>
  .back-button-wrapper {
    padding: 1rem;
    background-color: #f9f9f9;
  }
  
  .back-button {
    color: #007bff;
    font-weight: 500;
    text-decoration: none;
    font-size: 1rem;
    padding: 0.4rem 0.8rem;
    border: 1px solid #007bff;
    border-radius: 6px;
    background-color: #e7f3ff;
    transition: background-color 0.2s ease;
  }
  
  .back-button:hover {
    background-color: #d0e8ff;
  }
  </style>
  