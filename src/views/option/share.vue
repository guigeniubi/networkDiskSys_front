<template>
  <div class="dashboard-container">

    <!-- 保存到我的网盘表单 -->
    <div class="save">
      <!-- <el-tag>
        保存到我的网盘
      </el-tag> -->
      <el-input v-model="shareLink" placeholder="链接" />
      <el-input v-model="sharePassword" placeholder="密码" />
      <el-button @click="addToMyDrive">保存</el-button>
    </div>
  </div>

</template>
<script>
import fileApi from '@/api/file'
export default {
  mounted() {
    this.initChart();
  },
  data() {
    return {
      fileId: '',
      shareLink: '',
      sharePassword: '',

    };
  },

  methods: {
    async addToMyDrive() {
      try {
        const formData = new FormData()
        formData.append('shareLink', this.shareLink)
        formData.append('sharePassword', this.sharePassword)
        const res = await fileApi.addToMy(formData)
        if (res.code === 20000) {
          this.shareLink = ''
          this.sharePassword = ''
          this.$message({
            message: res.message,
            type: 'success'
          });
        }
      } catch (error) {
        this.$message({
          message: res.message,
          type: 'error'
        });
      }
    },

  }
}

</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
