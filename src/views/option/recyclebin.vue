<template>
  <div>
    <!-- 侧边栏 -->

    <!--搜索栏-->
    <el-card id="search">
      <el-row>
        <el-col :span="24" align="right">
          <el-input v-model="searchModel.fileName" placeholder="文件名" clearable></el-input>
          <el-button @click='getRecycleBinList' type="primary" round icon="el-icon-search">查询</el-button></el-col>
      </el-row>
    </el-card>
    <!--结果列表-->
    <el-card>
      <el-table :data="fileList" stripe style="width: 100%">
        <el-table-column label="#" width="80">
          <template slot-scope="scope">
            <!-- (pageNo-1)*pageSize+index+1 -->
            {{ (searchModel.pageNo - 1) * searchModel.pageSize + scope.$index + 1 }}
          </template>

        </el-table-column>

        <el-table-column prop="fileName" label="文件名" width="260">
        </el-table-column>

        <el-table-column prop="expiredTime" label="到期时间">
        </el-table-column>
        <el-table-column prop="fileSize" label="大小">
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button @click="deleteFile(scope.row)" type="danger" icon="el-icon-delete" size="mini"
              circle></el-button>
            <el-button @click="restoreFile(scope.row)" type="info" icon="el-icon-refresh-left" size="mini"
              circle></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--分页组件-->
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="searchModel.pageNo" :page-sizes="[5, 10, 20, 50]" :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>


  </div>

</template>

<script>
import fileApi from '@/api/file'
import roleApi from '@/api/roleManager'
import menuApi from '@/api/menuManger'
import FileUploadComponent from "@/components/FileUploadComponent.vue";

export default {
  components: {
    FileUploadComponent
  },
  data() {
    return {
      menuList: [],
      menuProps: {
        children: 'children',
        label: 'title'
      },
      formLabelWidth: '130px',
      roleForm: {},
      dialogFormVisible: false,
      title: "",
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 10,
        // type:"all"
      },
      fileList: [],
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2  到 20 个字符', trigger: 'blur' }
        ],

      },
      showSidebar: false, // 控制侧边栏的显示与隐藏
      showShareDialog: false, // 控制分享对话框的显示
      shareLink: '', // 存储生成的分享链接
      sharePassword: '', // 存储生成的分享密码
    }
  },
  methods: {
    getRecycleBinList() {
      fileApi.getRecycleBinList(this.searchModel).then(response => {
        this.fileList = response.data.rows;
        this.total = response.data.total;
      });
    },
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.getRecycleBinList();
    },
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getRecycleBinList();
    },
    deleteFile(file) {
      this.$confirm(`您确认删除文件${file.fileName}?`, '此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        fileApi.deleteFileByID(file.fileId).then(response => {
          this.$message({
            type: 'success',
            message: response.message
          });
          this.getRecycleBinList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除!'
        });
      });
    },
    restoreFile(file) {
      this.$confirm(`您确认恢复文件${file.fileName}?`, '此操作将恢复该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        fileApi.restoreFile(file.fileId).then(response => {
          this.$message({
            type: 'success',
            message: response.message
          });
          this.getRecycleBinList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消恢复!'
        });
      });
    },
  },
  created() {
    this.getRecycleBinList();
  },

};

</script>

<style>
#search .el-input {
  width: 200px;
  margin-right: 10px;
}

.el-dialog .el-input {
  width: 85%;
}
</style>