<template>
  <div>
    <!-- 侧边栏 -->
    <el-drawer title="文件上传" :visible="showSidebar" direction="ltr" :before-close="beforeClose">
      <!-- 文件上传组件 -->
      <FileUploadComponent />
    </el-drawer>
    <!--搜索栏-->
    <el-card id="search">
      <el-row><!--24分-->
        <el-col :span="4">
          <el-button type="primary" @click="showUploadSidebar">上传<i
              class="el-icon-upload el-icon--right"></i></el-button></el-col>
        <el-col :span="20" align="right">
          <el-input v-model="searchModel.fileName" placeholder="文件名" clearable></el-input>
          <el-button @click='getFileList' type="primary" round icon="el-icon-search">查询</el-button></el-col>

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
          9
        </el-table-column>

        <el-table-column prop="fileName" label="文件名" width="260">
        </el-table-column>

        <el-table-column prop="updateTime" label="修改时间">
        </el-table-column>
        <el-table-column prop="fileSize" label="大小">
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button @click="rename(scope.row.fileId)" type="primary" icon="el-icon-edit" size="mini"
              circle></el-button>
            <el-button type="primary" icon="el-icon-share" size="mini" circle></el-button>
            <el-button type="primary" icon="el-icon-download" size="mini" circle></el-button>
            <el-button @click="deleteFile(scope.row)" type="danger" icon="el-icon-delete" size="mini"
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

  <!-- <Upload ref="uploadComponent">asd</Upload> -->
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
        fileType:"application"
      },
      fileList: [],
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2  到 20 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],

      },
      showSidebar: false, // 控制侧边栏的显示与隐藏
    }
  },
  methods: {
    getAllMenu() {
      menuApi.getAllMenu().then(response => {
        this.menuList = response.data;
      });
    }
    ,
    getFileList() {
      fileApi.getFileList(this.searchModel).then(response => {
        this.fileList = response.data.rows;
        this.total = response.data.total;
      });

    },
    saveRole() {
      this.$refs.roleFormRef.validate((valid) => {
        if (valid) {
          let checkedKeys = this.$refs.menuRef.getCheckedKeys();
          let halfCheckedKeys = this.$refs.menuRef.getHalfCheckedKeys();
          this.roleForm.menuIdList = checkedKeys.concat(halfCheckedKeys);

          //提交给后台
          roleApi.saveRole(this.roleForm).then(response => {
            this.$message({
              message: response.message,
              type: 'success'
            });
            this.dialogFormVisible = false;
            this.getFileList();

          });
        }
        else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    clearForm() {
      this.roleForm = {};
      this.$refs.roleFormRef.clearValidate();
      // this.$refs.menuRef.setCheckKeys([]);
    },
    rename(fileId) {

    },

    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.getFileList();
    },
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getFileList();
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
          this.getFileList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除!'
        });
      });
    },
    showUploadSidebar() {
      this.showSidebar = true;
    },
    // 侧边栏关闭前的回调
    beforeClose(done) {
      this.showSidebar = false;
      this.getFileList()
      done();
    },

  },
  created() {
    this.getFileList();
    this.getAllMenu();
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