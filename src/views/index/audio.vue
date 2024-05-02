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
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="info" icon="el-icon-view" size="mini" circle @click="handlePreview(scope.row)"></el-button>
            <el-button @click="toggleEdit(scope.row)" type="primary" icon="el-icon-edit" size="mini" circle></el-button>
            <el-button @click="shareFile(scope.row.fileId)" type="primary" icon="el-icon-share" size="mini"
              circle></el-button>
            <el-button @click="download(scope.row.fileId)" type="primary" icon="el-icon-download" size="mini"
              circle></el-button>
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
    <el-dialog title="分享链接" :visible.sync="showShareDialog" width="30%" :before-close="handleClose">
      <div>分享链接: <el-input v-model="shareLink" readonly /></div>
      <div>分享密码: <el-input v-model="sharePassword" readonly /></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showShareDialog = false">取消</el-button>
        <el-button type="primary" @click="copyShareInfo">复制信息</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="showPreviewDialog" title="文件预览" width="80%"
      @update:visible="handlePreviewVisibilityChange">
      <div class="preview-container" v-if="previewUrl">
        <img v-if="previewType === 'image'" :src="previewUrl" alt="Image Preview" class="preview-image" />
        <video v-if="previewType === 'video'" controls class="preview-video">
          <source :src="previewUrl" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <audio v-if="previewType === 'audio'" controls class="preview-audio">
          <source :src="previewUrl" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>

      </div>
      <div v-if="previewType === 'other'">
        该文件格式暂时不支持预览
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showPreviewDialog = false">关闭</el-button>
      </span>
    </el-dialog>



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
      showPreviewDialog: false,
      previewUrl: null,
      previewType: null,
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
        fileType: "audio"
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

      fileApi.saveRename(fileId, newFileName)
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
    handlePreview(row) {
      const fileType = this.getFileType(row.fileType); // 根据文件类型选择预览方式
      console.log(fileType);
      if (fileType !== "other") {
        fileApi.previewFile(row.fileId)
          .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data], { type: row.fileType }));
            console.log(url);
            this.previewUrl = url;
            this.previewType = fileType;
            console.log(fileType);
            this.showPreviewDialog = true;
          })
          .catch(error => {
            console.error("Error during file preview:", error);
            this.$message.error(`文件预览失败: ${error.message || '未知错误'}`);
          });
      } else {
        this.previewType = fileType;
        this.showPreviewDialog = true;
      }

    },
    getFileType(fileType) {
      if (fileType.startsWith("image/")) return 'image';
      if (fileType.startsWith("video/")) return 'video';
      if (fileType.startsWith("audio/")) return 'audio';
      if (fileType === "application/pdf") return 'image';
      return 'other'; // 其他类型用其他方式预览
    },
    handlePreviewVisibilityChange(visible) {
      if (!visible) {
        // 当对话框被隐藏时，停止播放媒体
        this.stopMediaPlayback();
      }
    },
    stopMediaPlayback() {
      if (this.previewType === 'audio' || this.previewType === 'video') {
        const mediaElement = document.querySelector('.preview-container > video, .preview-container > audio');
        if (mediaElement) {
          mediaElement.pause();
          mediaElement.currentTime = 0; // 重置播放时间
        }
      }
    },
    deleteFile(file) {
      this.$confirm(`移入后可在7天内恢复该文件, 是否继续?`, '您确认将文件移入回收站?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        fileApi.moveToTrash(file.fileId).then(response => {
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
    shareFile(fileId) {
      fileApi.shareFile(fileId)
        .then(response => {
          this.shareLink = response.data.shareLink;
          this.sharePassword = response.data.sharePassword;

          // 打开对话框
          this.showShareDialog = true;
        })
        .catch(error => {
          console.error('分享文件失败:', error);
          this.$message.error('分享文件失败');
        });
    },
    copyShareInfo() {
      let shareInfo = `链接: ${this.shareLink}\n密码: ${this.sharePassword}`;
      navigator.clipboard.writeText(shareInfo).then(() => {
        this.$message.success('分享信息已复制到剪贴板');
        this.showShareDialog = false; // 关闭对话框
      }, (err) => {
        console.error('无法复制到剪贴板', err);
      });
    },
    handleClose() {
      this.showShareDialog = false;
    },
    download(fileId) {
      const downloadUrl = `http://localhost:9999/file/download/${fileId}`;
      // 创建一个a标签
      const link = document.createElement('a');
      link.href = downloadUrl;
      // 由于文件名是在后端通过Content-Disposition设置的，所以这里不需要设置下载文件名
      // link.setAttribute('download', 'filename');
      document.body.appendChild(link); // 必须将链接添加到DOM中才能正确触发下载
      link.click(); // 模拟点击实现下载
      document.body.removeChild(link); // 下载后移除元素
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

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  /* 固定高度 */
}

.preview-image,
.preview-video {
  max-height: 100%;
  /* 高度自适应 */
  width: auto;
  /* 宽度自适应 */
}

.preview-video {
  max-width: 100%;
  /* 视频宽度自适应 */
}

.preview-audio {
  display: block;
  /* 设置为块级元素 */
  margin-top: 20px;
  /* 上边距 */
  max-width: 80%;
  /* 音频宽度自适应 */
}
</style>