<template>
  <div class="container">
    <section class="section">
      <NuxtLink to="/loans" class="main-link">
        <i class="pi pi-database icon-main" /> Conditions Clearing Base
      </NuxtLink>
      <!--<p class="section-description">Explore the complete overview of loan data.</p>-->
    </section>
    <section class="section subtables">
      <NuxtLink to="/Loan-Pipeline" class="sub-link">
        ➤ Loan Pipeline
      </NuxtLink>
      <NuxtLink to="/Deal-Conditions" class="sub-link">
        ➤ Deal Conditions
      </NuxtLink>
      <NuxtLink to="/Response-Submissions" class="sub-link">
        ➤ Response Submissions
      </NuxtLink>
    </section>
  </div>
</template>

<style scoped>
@import 'primeicons/primeicons.css';

html, body {
  margin: 0;
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;   
  align-items: center;       
  height: 100vh;
  font-family: 'Poppins', sans-serif;
  text-align: center;
  padding: 2rem;
}

.section {
  margin-bottom: 2rem;
}

.main-link {
  font-size: 1.4rem;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.main-link:hover {
  color: #007bff;
}

.icon-main {
  font-size: 1.6rem;
  color: #3498db; 
}

.section-description {
  color: #666;
  font-size: 0.95rem;
  margin-top: 0.3rem;
}

.subtables {
  padding-left: 1rem;
  border-left: 2px solid #ccc;
  text-align: left;
  display: inline-block;
}

.sub-link {
  display: block;
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  text-decoration: none;
  color: #34495e;
  padding-left: 0.5rem;
}

.sub-link:hover {
  color: #007bff;
}
</style>
