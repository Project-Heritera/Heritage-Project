import socket

host = "zqdljqdvyhpbxqlleyjg.supabase.co"
port = 5432

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5)  # 5 second timeout

try:
    sock.connect((host, port))
    print("Connection successful")
except Exception as e:
    print("Connection failed:", e)
finally:
    sock.close()
