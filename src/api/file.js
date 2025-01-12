import request from "@/utils/request";

export default {
  getUploadedChunks(hash) {
    return request({
      url: "/file/uploaded",
      method: "get",
      params: { hash: hash },
    });
  },
  getFileList(searchModel) {
    return request({
      url: "/file/list",
      method: "get",
      params: {
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        fileName: searchModel?.fileName,
        fileType: searchModel?.fileType,
      },
    });
  },
  getRecycleBinList(searchModel) {
    return request({
      url: `/file/recycleBinList`,
      method: "get",
      params: {
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
      },
    });
  },
  getTopDownloadList(searchModel) {
    return request({
      url: "/file/top-downloads",
      method: "get",
      params: {
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        fileName: searchModel?.fileName,
      },
    });
  },
  uploadSingle(formData) {
    return request({
      url: "/file/upload/single",
      method: "post",
      headers: { "Content-Type": "multipart/form-data" },
      data: formData,
    });
  },
  postChunks(formData) {
    return request({
      url: "/file/upload/chunk",
      method: "post",
      headers: { "Content-Type": "multipart/form-data" },
      data: formData,
    });
  },
  merge(hash, fileName) {
    return request({
      url: "/file/mergeChunks",
      method: "post",
      params: { hash: hash, fileName: fileName },
    });
  },
  previewFile(fileId) {
    return request({
      url: `/file/preview/${fileId}`,
      method: "get",
      responseType: "blob", // 确保响应是一个Blob对象，适合于文件流
      skipCustomErrorHandler: true,
    });
  },
  updateFile(file) {
    return request({
      url: "/file",
      method: "put",
      data: file,
    });
  },
  restoreFile(fileId) {
    return request({
      url: `/file/restore/${fileId}`,
      method: "put",
    });
  },
  saveRole(role) {
    if (role.roleId == null && role.roleId == undefined) {
      return this.addRole(role);
    }
    return this.updateRole(role);
  },
  deleteFileByID(id) {
    return request({
      url: `/file/delete/${id}`,
      method: "delete",
    });
  },
  moveToTrash(id) {
    return request({
      url: `/file/moveToTrash/${id}`,
      method: "put",
    });
  },
  saveRename(id, fileName) {
    return request({
      url: `/file/rename/${id}`,
      params: { fileName: fileName },
      method: "put",
    });
  },
  shareFile(fileId) {
    return request({
      url: `/share/file`,
      params: { fileId: fileId },
      method: "post",
    });
  },
  addToMy(formData) {
    return request({
      url: `/share/addtomydrive`,
      data: formData,
      method: "post",
    });
  },
  download(fileId) {
    return request({
      url: `/file/download/${fileId}`,
      method: "get",
      responseType: "blob",
    });
  },
  getHadoopInfo() {
    return request({
      url: `/file/userSpace`,
      method: "get",
    });
  },
};
