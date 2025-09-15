import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService extends MainService {

  constructor() {
    super();
  }

  showSuccessToast(title: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: 'success',
      title
    })
  }

  showErrorToast(title: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: 'error',
      title
    })
  }

  showWarningToast(title: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: 'warning',
      title
    })
  }

  showSuccessAlert(title: string, text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#7cd1f9',
      color: "#717171",
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  showInfoAlert(text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#a5dc86",
      color: "#717171",
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  showErrorAlert(title: string, text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      color: "#717171",
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#6e7881',
    });
  }

  showWarningAlert(title: string, text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      color: "#717171",
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#EB9631',
      showClass: {
        popup: 'animate__animated animate__zoomIn'
      },
      hideClass: {
        popup: 'animate__animated animate__zoomOut'
      }
    });
  }

  showDeleteAlert(title: string, text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      color: "#717171",
      customClass: {
        container: 'delete-icon-color'
      },
      showCancelButton: true,
      confirmButtonColor: '#ff5f5f',
      confirmButtonText: 'Eliminar',
      reverseButtons: true
    });
  }

  showConfirmAlert(title: string, text: string): Promise<SweetAlertResult> {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-info'
      },
      buttonsStyling: false
    });

    return swalWithBootstrapButtons.fire({
      title,
      text,
      icon: 'success',
      color: "#717171",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirmar!',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      allowOutsideClick: false,
      reverseButtons: true
    });
  }

  showYesNoAlert(title: string, text: string): Promise<SweetAlertResult> {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        title: 'title-yes-no-alert',
        confirmButton: 'btn btn-info',
        cancelButton: 'btn btn-secondary',
        container: 'yes-no-alert'
      },
      buttonsStyling: false
    });

    return swalWithBootstrapButtons.fire({
      title,
      text,
      icon: 'question',
      color: "#717171",
      showCancelButton: true,
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      reverseButtons: true
    });
  }

  showLoadingAlert(text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  showLoading() {
    return Swal.showLoading();
  }

  closeLoading() {
    return Swal.close();
  }
}