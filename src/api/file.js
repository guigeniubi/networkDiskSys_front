import request from "@/utils/request";

export default {
  getFileList(searchModel) {
    return request({
      url: "/file/list",
      method: "get",
      params: {
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        fileName: searchModel.fileName,
        type: searchModel.type
      },
    });
  },
  uploadSingle(formData){
    return request({
      url:'/file/upload/single',
      method:'post',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData
    })
  },
  postChunks(formData) {
    return request({
      url: '/file/upload/chunk',
      method: 'post',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData
    })
  },
  addRole(role) {
    return request({
      url: "/role",
      method: "post",
      data: role,
    });
  },
  merge(hash) {
    return request({
      url: '/file/mergeChunks',
      method: 'post',
      params: { hash: hash }
    })

  },
  getRoleById(id) {
    return request({
      // url:'/role/'+id,
      url: `/role/${id}`,
      method: "get",
    });
  },
  updateFile(file) {
    return request({
      url: "/file",
      method: "put",
      data: file,
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
  rename(id){
    return request({
      url: `/file/rename/${id}`,
      method: "put",
    })
  }
};
