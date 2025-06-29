import qrcode
import os
from pathlib import Path


from core.config import settings

class QRCodeService:
    def __init__(self, base_url: str = "https://yourdomain.com", qr_dir: str = "static/qr_codes"):
        self.base_url = base_url.rstrip('/')
        self.qr_dir = Path(qr_dir)
        self.qr_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_table_qr_code(self, table_id: str, table_name: str, mess_slug:str) -> str:
        """Generate QR code for mess table"""
        table_url = f"{self.base_url}/{mess_slug}?t={table_id}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        qr.add_data(table_url)
        qr.make(fit=True)
        
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Generate safe filename
        safe_name = "".join(c for c in table_name if c.isalnum() or c in (' ', '-', '_')).strip()
        filename = f"table_{table_id}_{safe_name.replace(' ', '_')}.png"
        file_path = self.qr_dir / filename
        
        qr_image.save(file_path)
        return f"/media/qr_codes/{filename}"  # Return web-accessible path
    
    def delete_qr_code(self, qr_code_url: str):
        """Delete QR code file"""
        if qr_code_url and qr_code_url.startswith("/media/qr_codes/"):
            file_path = Path("media") / "qr_codes" / qr_code_url.split("/")[-1]
            if file_path.exists():
                os.remove(file_path)

qr_service = QRCodeService(
    base_url=settings.CLIENT_URL,
    qr_dir="media/qr_codes"
)
