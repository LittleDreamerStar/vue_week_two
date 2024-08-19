<template>
  <Card v-if="!Token" style="width: 50%; margin: 15% auto; overflow: hidden; text-align: center">
    <template #title>
      <div style="margin-bottom: 1.5rem; font-size: 2.5rem">TODO's LIST</div>
    </template>
    <template #content>
      <div class="flex w-full align-items-center items-center gap-4 mb-4">
        <label for="user" class="font-semibold">信箱：</label>
        <InputText id="user" type="email" v-model="singIn.email" class="flex-auto" />
      </div>
      <div class="flex w-full align-items-center items-center gap-4 mb-4">
        <label for="password" class="font-semibold">密碼：</label>
        <InputText id="password" type="password" v-model="singIn.password" class="flex-auto" />
      </div>
    </template>

    <template #footer>
      <div class="flex mt-2 justify-content-between align-items-center">
        <Button label="註冊" @click="singUpRef = true" severity="info" />
        <div class="flex">
          <Button label="登入" class="mr-4" @click="singInButton" />
          <Button
            label="清除"
            severity="secondary"
            outlined
            @click="(singIn.email = ''), (singIn.password = '')"
          />
        </div>
      </div>
    </template>
  </Card>

  <Card v-if="Token" style="width: 50%; margin: 15% auto; overflow: hidden; text-align: center">
    <template #title>
      <div style="margin-bottom: 1.5rem; font-size: 2.5rem">TODO's LIST</div>
    </template>
    <template #content>
      <div class="flex align-items-center items-center justify-content-between">
        <InputText placeholder="加入代辦事項" class="mr-3 flex-auto" v-model="addTodo" />
        <Button severity="success" raised icon="pi pi-plus" @click="todosButton('add')" />
      </div>
      <table :style="{ width: '100%', borderSpacing: '0 10px' }" class="mt-4 mb-6">
        <thead>
          <tr>
            <th style="width: 5%"></th>
            <th style="width: 75%">代辦事項</th>
            <th style="width: 10%">編輯</th>
            <th style="width: 10%">刪除</th>
          </tr>
        </thead>
        <tbody v-if="todoListdata.length">
          <tr v-for="item in todoListdata" :key="item.id">
            <td v-if="editTodo.id !== item.id">
              <Checkbox v-model="item.status" :binary="true" @click="todosButton('update', item)" />
            </td>
            <td
              v-if="editTodo.id !== item.id"
              :style="{ textDecoration: item.status ? 'line-through' : 'none' }"
            >
              {{ item.content }}
            </td>
            <td v-if="editTodo.id !== item.id">
              <Button
                icon="pi pi-pen-to-square"
                severity="secondary"
                rounded
                @click="editTodo = item"
              />
            </td>
            <td v-if="editTodo.id !== item.id">
              <Button
                icon="pi pi-ban"
                rounded
                severity="warn"
                @click="todosButton('delete', item)"
              />
            </td>
            <td v-if="editTodo.id === item.id"></td>
            <td v-if="editTodo.id === item.id">
              <InputText style="width: 80%" v-model="editTodo.content" />
            </td>
            <td v-if="editTodo.id === item.id">
              <Button label="確定" severity="success" rounded @click="todosButton('edit', item)" />
            </td>
            <td v-if="editTodo.id === item.id">
              <Button label="取消" severity="secondary" rounded @click="editTodo = {}" />
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!todoListdata.length" class="mt-4 mb-6 flex-auto">無代辦事項</div>
    </template>

    <template #footer>
      <div class="flex mt-2 justify-content-start align-items-center">
        <div class="flex">
          <Button label="登出" severity="danger" class="mr-4" @click="singOutButton" />
          <Button label="驗證" severity="secondary" outlined @click="checkToken" />
        </div>
      </div>
    </template>
  </Card>

  <Dialog v-model:visible="singUpRef" modal header="註冊系統" :style="{ width: '25rem' }">
    <div class="flex align-items-center items-center gap-4 mb-4">
      <label for="add-email" class="font-semibold">信箱：</label>
      <InputText id="add-email" class="flex-auto" v-model="addNewUser.email" />
    </div>
    <div class="flex align-items-center items-center gap-4 mb-4">
      <label for="add-password" class="font-semibold">密碼：</label>
      <InputText
        toggleMask
        type="password"
        id="add-password"
        class="flex-auto"
        v-model="addNewUser.password"
      />
    </div>
    <div class="flex align-items-center items-center gap-4 mb-8">
      <label for="nickname" class="font-semibold">名字：</label>
      <InputText id="nickname" class="flex-auto" v-model="addNewUser.nickname" />
    </div>
    <div class="flex justify-content-end gap-2">
      <Button type="button" label="送出" @click="singUpAdd" />
      <Button type="button" label="取消" severity="secondary" @click="singUpCancel" />
    </div>
  </Dialog>
  <Toast />
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Checkbox from 'primevue/checkbox'

const toast = useToast()

const show = (message, data) => {
  toast.add({
    severity: 'success',
    summary: message,
    detail: data,
    life: 5000
  })
}

const errorShow = (title, message) => {
  toast.add({
    severity: 'error',
    summary: title,
    detail: message,
    life: 5000
  })
}

const apiUri = 'https://todolist-api.hexschool.io'
const users = `${apiUri}/users`
const todos = `${apiUri}/todos`
const sing_up = `${users}/sign_up`
const sing_out = `${users}/sign_out`
const sing_in = `${users}/sign_in`
const check_out = `${users}/checkout`

const singUpRef = ref(false)

const addNewUser = ref({
  email: '',
  password: '',
  nickname: ''
})

const singIn = ref({
  email: '',
  password: ''
})

const Token = ref('')

const todoListdata = ref([])

const addTodo = ref('')
const editTodo = ref({})

const singUpAdd = async () => {
  try {
    const response = await axios.post(sing_up, {
      ...addNewUser.value
    })
    show(
      '註冊成功',
      `信箱：${addNewUser.value.email},
    名稱：${addNewUser.value.nickname},
    UID：${response.data.uid}`
    )

    singUpRef.value = false
  } catch (error) {
    errorShow('註冊失敗', error.response.data.message)
    console.error(error)
  }
}

const singInButton = async () => {
  try {
    const response = await axios.post(sing_in, {
      ...singIn.value
    })

    const responseTodosList = await axios.get(todos, {
      headers: {
        Authorization: response.data.token
      }
    })

    show(
      '登入成功',
      `信箱：${singIn.value.email},
    名稱：${response.data.nickname}`
    )

    todoListdata.value = responseTodosList.data.data

    singIn.value = {
      email: '',
      password: ''
    }
    Token.value = response.data.token
    document.cookie = `vue_cookie_token=${response.data.token}; expires=${new Date(response.data.exp * 1000)}`
  } catch (error) {
    errorShow('登入失敗', error.response.data.message)
    console.error(error)
  }
}

const singUpCancel = () => {
  singUpRef.value = false
  addNewUser.value = {
    email: '',
    password: '',
    nickname: ''
  }
}

const checkToken = async () => {
  try {
    const response = await axios.get(check_out, {
      headers: {
        Authorization: Token.value
      }
    })
    show(
      '驗證成功',
      `名稱：${response.data.nickname},
      UID：${response.data.uid},`
    )
  } catch (error) {
    errorShow('驗證失敗', error.response.data.message)
    console.error(error)
  }
}

const singOutButton = async () => {
  try {
    const response = await axios.post(
      sing_out,
      {},
      {
        headers: {
          Authorization: Token.value
        }
      }
    )
    show('登出結果', `${response.data.message}`)
    Token.value = ''
    document.cookie = "vue_cookie_token=''; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
  } catch (error) {
    errorShow('登出失敗', error.response.data.message)
    console.error(error)
  }
}

const todosButton = async (parameters, id) => {
  try {
    if (parameters === 'add') {
      const response = await axios.post(
        todos,
        {
          content: addTodo.value
        },
        {
          headers: {
            Authorization: Token.value
          }
        }
      )
      addTodo.value = ''
      show('新增成功', `${response.data.newTodo.content}`)
    }
    if (parameters === 'delete') {
      const response = await axios.delete(`${todos}/${id.id}`, {
        headers: {
          Authorization: Token.value
        }
      })
      show(response.data.message, `${id.content}`)
    }
    if (parameters === 'edit') {
      const response = await axios.put(
        `${todos}/${id.id}`,
        {
          content: editTodo.value.content
        },
        {
          headers: {
            Authorization: Token.value
          }
        }
      )
      show(response.data.message)
      editTodo.value = {}
    }
    if (parameters === 'update') {
      const response = await axios.patch(
        `${todos}/${id.id}/toggle`,
        {},
        {
          headers: {
            Authorization: Token.value
          }
        }
      )
      show(response.data.message)
    }

    const responseTodosList = await axios.get(todos, {
      headers: {
        Authorization: Token.value
      }
    })

    todoListdata.value = responseTodosList.data.data
  } catch (error) {
    errorShow(
      parameters === 'add'
        ? '新增失敗'
        : parameters === 'edit'
          ? '編輯失敗'
          : parameters === 'update'
            ? '更新失敗'
            : '狀態失敗',
      error.response.data.message
    )
    console.error(error)
  }
}

const TodoToken = document.cookie
  .split('; ')
  .find((row) => row.startsWith('vue_cookie_token='))
  ?.split('=')[1]

onMounted(() => {
  document.cookie = "vue_cookie_token=''; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
})
onMounted(() => {
  if (TodoToken) Token.value = TodoToken
})
</script>
