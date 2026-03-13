<template>
  <main class="home">

    <div class="topbar">
      <img src="/codeway_logo.png" alt="Logo" class="logo" />
      <select v-model="selectedCountry" @change="fetchData" class="country-select">
        <option value="TR">TR</option>
        <option value="FR">FR</option>
        <option value="DE">DE</option>
      </select>
      <button class="btn-logout" @click="logout">Logout</button>
    </div>

    <section class="forms">
      <div class="list">

        <div class="row header">
          <div class="column"><h2>Parameter Key</h2></div>
          <div class="column"><h2>Value</h2></div>
          <div class="column"><h2>Description</h2></div>
          <div class="column"></div>
          <div class="column"></div>
        </div>

        <div class="row" v-for="item in configRows" :key="item.key">

          <div class="column">
            <span v-if="!item.editing">{{ item.key }}</span>
            <input v-else v-model="item.editKey" type="text" />
          </div>

          <div class="column">
            <span v-if="!item.editing">{{ item.value }}</span>
            <input v-else v-model="item.editValue" type="text" />
          </div>

          <div class="column">
            <span v-if="!item.editing">{{ descriptions[item.key]?.text || '' }}</span>
            <input v-else v-model="descriptions[item.key].text" @input="saveDescriptions" type="text" placeholder="Add a description..." />
          </div>

          <div class="column"></div>

          <div class="column actions">
            <template v-if="!item.editing">
              <button class="btn-edit" @click="startEdit(item)">Edit</button>
              <button class="btn-delete" @click="handleDelete(item.key)">Delete</button>
            </template>
            <template v-else>
              <button class="btn-save" @click="handleSave(item)">Save</button>
              <button class="btn-cancel" @click="cancelEdit(item)">Cancel</button>
            </template>
          </div>

        </div>
        
        <div class="row add-row">
          <div class="column">
            <input v-model="newRow.key" type="text" placeholder="New Parameter" />
          </div>
          <div class="column">
            <input v-model="newRow.value" type="text" placeholder="Value" />
          </div>
          <div class="column">
            <input v-model="newRow.description" type="text" placeholder="New Description" />
          </div>
          <div class="column"></div>
          <div class="column actions">
            <button class="btn-add" @click="handleAdd">Add</button>
          </div>
        </div>

      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { db } from '../firebase'
import { collection, getDocs, updateDoc, doc, deleteField, getDoc } from 'firebase/firestore'

interface ConfigRow {
  key: string
  value: any
  editing: boolean
  editKey: string
  editValue: string
}

export default defineComponent({
  name: 'HomeView',
  setup() {
    const store = useStore()
    const logout = () => {
      store.dispatch('logout')
    }
    const configRows = ref<ConfigRow[]>([])
    const descriptions = ref<Record<string, { text: string }>>(
      JSON.parse(localStorage.getItem('descriptions') || '{}')
    )
    const saveDescriptions = () => {
      localStorage.setItem('descriptions', JSON.stringify(descriptions.value))
    }
    const creationDate = ref<string>('')
    const docId = ref<string>('')
    const newRow = ref({ key: '', value: '', description: '' })

    const selectedCountry = ref('TR')

    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "Config List", selectedCountry.value))
      if (docSnap.exists()) {
        docId.value = docSnap.id
        const data = docSnap.data()

        configRows.value = Object.entries(data).map(([key, value]) => ({
          key,
          value,
          editing: false,
          editKey: key,
          editValue: String(value)
        }))

        configRows.value.forEach(({ key }) => {
          if (!descriptions.value[key]) {
            descriptions.value[key] = { text: '' }
          }
        })
        saveDescriptions()
      } else {
        // Document doesn't exist for this country yet
        configRows.value = []
        docId.value = ''
      }
    }

    onMounted(fetchData)

    const startEdit = (item: ConfigRow) => {
      item.editKey = item.key
      item.editValue = String(item.value)
      item.editing = true
    }

    const cancelEdit = (item: ConfigRow) => {
      item.editing = false
    }

    const handleSave = async (item: ConfigRow) => {
      try {
        const docRef = doc(db, "Config List", docId.value)

        if (item.editKey !== item.key) {
          const updatePayload: Record<string, any> = {}
          updatePayload[item.key] = deleteField()
          updatePayload[item.editKey] = item.editValue
          await updateDoc(docRef, updatePayload)

          descriptions.value[item.editKey] = descriptions.value[item.key]
          delete descriptions.value[item.key]
          saveDescriptions()
        } else {
          const updatePayload: Record<string, any> = {}
          updatePayload[item.key] = item.editValue
          await updateDoc(docRef, updatePayload)
        }

        item.key = item.editKey
        item.value = item.editValue
        item.editing = false
      } catch (error) {
        console.error("Error saving document: ", error)
      }
    }

    const handleDelete = async (key: string) => {
      try {
        const docRef = doc(db, "Config List", docId.value)
        const updatePayload: Record<string, any> = {}
        updatePayload[key] = deleteField()
        await updateDoc(docRef, updatePayload)

        configRows.value = configRows.value.filter(item => item.key !== key)
        delete descriptions.value[key]
        saveDescriptions()
      } catch (error) {
        console.error("Error deleting field: ", error)
      }
    }

    const handleAdd = async () => {
      if (!newRow.value.key || !newRow.value.value) {
        alert("Key and Value are required.")
        return
      }

      try {
        const docRef = doc(db, "Config List", docId.value)
        const updatePayload: Record<string, any> = {}
        updatePayload[newRow.value.key] = newRow.value.value
        await updateDoc(docRef, updatePayload)

        configRows.value.push({
          key: newRow.value.key,
          value: newRow.value.value,
          editing: false,
          editKey: newRow.value.key,
          editValue: newRow.value.value
        })

        descriptions.value[newRow.value.key] = { text: newRow.value.description }
        saveDescriptions()

        newRow.value = { key: '', value: '', description: '' }
      } catch (error) {
        console.error("Error adding field: ", error)
      }
    }

    return { configRows, descriptions, creationDate, newRow, selectedCountry,
      logout, saveDescriptions, startEdit, cancelEdit, handleSave, handleDelete, handleAdd, fetchData }
  }
})
</script>

<style scoped>

.forms {
  display: flex;
  min-height: 100vh;
  padding: 8rem 1rem 1rem;
  background-color: #1e1e2d;
  background-image: linear-gradient(
    to bottom right,
    rgba(30, 30, 41) 0%,
    rgba(30, 30, 37) 100%
  );
}

.list {
  width: 100%;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  padding: 0.5rem 0;
}

.column {
  padding: 0 1rem;
  color: rgba(255, 255, 255, 0.705);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

h2 {
  color: #5d6b80;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

input {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  width: 100%;
}

button {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.add-row {
  margin-top: 1rem;
  padding-top: 1rem;
}

.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: #1e1e2d;
  z-index: 100;
}

.logo {
  height: 32px;
  width: auto;
}

.btn-edit   { background: #055ea7; color: white; }
.btn-delete { background: #a80000; color: white; }
.btn-save   { background: #057a3a; color: white; }
.btn-cancel { background: #444;    color: white; }
.btn-add { background: #057a3a; color: white; }
.btn-logout {
  background: #a80000;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.country-select {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 0.3rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.country-select option {
  background: rgb(0, 0, 23);
  color: white;
}

@media screen and (max-width: 672px) {

  .row.header {
    display: none;
  }

  .row {
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 24px;
    padding: 1rem;
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  .column:nth-child(1)::before { content: "Parameter Key"; }
  .column:nth-child(2)::before { content: "Value"; }
  .column:nth-child(3)::before { content: "Description"; }

  .column::before {
    display: block;
    font-size: 0.75rem;
    color: #055ea79b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.2rem;
    font-weight: bold;
  }

  .column:empty {
    display: none;
  }

  .actions {
    justify-content: flex-start;
    padding: 0 1rem;
  }

  .add-row {
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 8px;
    margin-top: 1rem;
    padding: 1rem;
  }

  .add-row .column:nth-child(1)::before { content: "Parameter Key"; }
  .add-row .column:nth-child(2)::before { content: "Value"; }
  .add-row .column:nth-child(3)::before { content: "Description"; }
}

</style>