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

        </el-table-column>

        <el-table-column prop="fileName" label="文件名" width="260">
          <template slot-scope="scope">
            <template v-if="!scope.row.editing">
              {{ scope.row.fileName }}
            </template>
            <template v-if="scope.row.editing">
              <el-input v-model="scope.row.newFileName" size="mini"></el-input>

            </template>
            <el-popover ref="popover" trigger="click" placement="top-start" v-model="scope.row.popoverVisible">
              <div>
                <p>重命名</p>
                <div style="text-align: right; margin-top: 10px;">
                  <el-button size="mini" type="primary" @click="saveRename(scope.row)">确认</el-button>
                  <el-button size="mini" @click="cancelEdit(scope.row)">取消</el-button>
                </div>
              </div>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="修改时间">
        </el-table-column>
        <el-table-column prop="fileSize" label="大小">
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button @click="toggleEdit(scope.row)" type="primary" icon="el-icon-edit" size="mini" circle></el-button>
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
        fileType:"video"
      },
      fileList: [],
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2  到 20 个字符', trigger: 'blur' }
        ],

      },
      showSidebar: false, // 控制侧边栏的显示与隐藏
    }
  },
  methods: {
    // 切换编辑状态
    toggleEdit(row) {
      if (!row.editing) {
        this.enterEdit(row);
        row.popoverVisible = true;
      } else {
        row.editing = false;
        row.popoverVisible = false;
        // 在取消编辑时，恢复原始文件名
      }
    },
    // 进入编辑状态
    enterEdit(row) {
      this.$set(row, 'editing', true);

    },
    // 保存修改
    saveRename(row) {
      let fileId = row.fileId;
      let newFileName = row.newFileName;

        fileApi.saveRename(fileId,newFileName)
          .then(res => {
            this.$message({
              type: 'success',
              message: res.message
            });
            row.editing = false;
            row.popoverVisible = false;
            // 刷新文件列表
            this.getFileList();
          })
          .catch(error => {
            this.$message.error('重命名失败：' + error.message);
          });
    },
    cancelEdit(row) {
      row.editing = false;
      row.popoverVisible = false;
    },
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