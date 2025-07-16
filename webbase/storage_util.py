import os
import shutil
import subprocess
import re
from pathlib import Path
import configparser
import logging
import platform
from typing import Optional, List, Dict, Union
import stat
from static.py.server import *

# Constants
MEDIA = '/media'
RUN = '/run'
USERNAME = os.getenv('USER', 'user')  # Default to 'user' if USER env var is not set
LOG = logging.getLogger(__name__)

def get_storage_info(path=None):
    try:
        if path is None:
            config = configparser.ConfigParser()
            config.read('config/config.conf')
            path = config.get('DEVICE_INFO', 'path', fallback=None)
            if not path:
                return {
                    'success': False,
                    'error': 'No backup path configured'
                }
        
        if not os.path.exists(path):
            return {
                'success': False,
                'error': f'Path does not exist: {path}'
            }
            
        total, used, free = shutil.disk_usage(path)
        
        return {
            'success': True,
            'path': path,
            'name': os.path.basename(path),  # Derive name from path
            'total': total,
            'used': used,
            'free': free,
            'fraction': used / total if total > 0 else 0,
            'human_total': bytes_to_human(total),
            'human_used': bytes_to_human(used),
            'human_free': bytes_to_human(free)
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
    
def bytes_to_human(size: int, decimal_places: int = 1) -> str:
    """Convert bytes to human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size < 1024.0:
            break
        size /= 1024.0
    return f"{size:.{decimal_places}f} {unit}"

def get_all_storage_devices() -> List[Dict[str, Union[str, int, float]]]:
    """
    Get detailed information about all available storage devices
    
    Returns:
        List of dictionaries with device information including:
        - device: device path
        - mount_point: where mounted
        - filesystem: type
        - device: device identifier (e.g., /dev/sda1)
        - serial_number: device serial number (if available)
        - model: device model (if available)
        - size: bytes
        - human_size: readable size
        - type: device type
        - usage: if mounted
    """
    system = platform.system().lower()
    
    if system == 'linux':
        return _get_linux_devices()
    elif system == 'windows':
        return _get_windows_devices()
    elif system == 'darwin':
        return _get_mac_devices()
    else:
        LOG.warning(f"Unsupported operating system: {system}")
        return []

# Used to get drive information like model and serial number
def get_drive_info(device_path):  # Need to make it dynamically settable
    """
    Retrieves information (model, serial) for a drive given its device path.

    Args:
        device_path (str): The path to the block device (e.g., '/dev/sda').

    Returns:
        dict: A dictionary containing the device model and serial number,
            or None if information cannot be retrieved.
    """
    try:
        result = sub.run(
            ['lsblk', '--output', 'NAME,SERIAL,MODEL,TRAN,TYPE,SIZE,FSTYPE,MOUNTPOINT', device_path],
            capture_output=True,
            text=True,
            check=True
        )
        output_lines = result.stdout.strip().splitlines()
        if len(output_lines) < 2:
            return None
        
        header = output_lines[0].split()
        data = dict(zip(header, output_lines[1].split()))
        
        return {
            'path': data.get('MOUNTPOINT', 'N/A'),
            'device': data.get('NAME', 'N/A'),
            'model': data.get('MODEL', 'N/A'),
            'serial': data.get('SERIAL', 'N/A')
        }
    except sub.CalledProcessError as e:
        print(f"Error getting lsblk info for {device_path}: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def _get_linux_devices() -> List[Dict]:
    """Linux-specific device detection for /media and /run/media mounts"""
    devices = []
    
    try:
        # Get mounted filesystems from /proc/mounts
        with open('/proc/mounts', 'r') as f:
            for line in f:
                if line.startswith(('/dev/sd', '/dev/nvme', '/dev/mmcblk')):
                    parts = line.split()
                    mount_point = parts[1]
                    
                    # Only include devices mounted under /media or /run/media
                    if mount_point.startswith(('/media/', '/run/media/')):
                        device_info = {
                            'device': parts[0],
                            'mount_point': mount_point,
                            'name': get_device_display_name({'mount_point': mount_point, 'label': None}), 
                            'filesystem': parts[2],
                            'device': get_drive_info(parts[0][:8]).get('device', 'N/A') if get_drive_info(parts[0][:8]) else 'N/A',
                            'serial_number': get_drive_info(parts[0][:8]).get('serial', 'N/A') if get_drive_info(parts[0][:8]) else 'N/A',
                            'model': get_drive_info(parts[0][:8]).get('model', 'N/A') if get_drive_info(parts[0][:8]) else 'N/A',
                            'type': 'mounted'
                        }
                        # Add usage info if accessible
                        try:
                            usage = shutil.disk_usage(mount_point)
                            device_info.update({
                                'total': usage.total,
                                'used': usage.used,
                                'free': usage.free,
                                'fraction': usage.used / usage.total if usage.total > 0 else 0,
                                'human_total': bytes_to_human(usage.total),
                                'human_used': bytes_to_human(usage.used),
                                'human_free': bytes_to_human(usage.free)
                            })
                        except Exception as e:
                            LOG.debug(f"Couldn't get usage for {mount_point}: {e}")
                        
                        devices.append(device_info)
    
    except Exception as e:
        LOG.error(f"Error reading /proc/mounts: {e}")
    
    # Also check for unmounted devices in /media and /run/media
    media_paths = ['/media', '/run/media']
    for media_path in media_paths:
        if os.path.exists(media_path):
            try:
                for entry in os.listdir(media_path):
                    entry_path = os.path.join(media_path, entry)
                    if os.path.ismount(entry_path):
                        # Check if this device isn't already in our list
                        if not any(d['mount_point'] == entry_path for d in devices):
                            try:
                                usage = shutil.disk_usage(entry_path)
                                devices.append({
                                    'device': f"Unknown (mounted at {entry_path})",
                                    'mount_point': entry_path,
                                    'filesystem': 'unknown',
                                    'serial_number': 'N/A',
                                    'model': 'N/A',
                                    'type': 'mounted',
                                    'total': usage.total,
                                    'used': usage.used,
                                    'free': usage.free,
                                    'fraction': usage.used / usage.total if usage.total > 0 else 0,
                                    'human_total': bytes_to_human(usage.total),
                                    'human_used': bytes_to_human(usage.used),
                                    'human_free': bytes_to_human(usage.free)
                                })
                            except Exception as e:
                                LOG.debug(f"Couldn't get usage for {entry_path}: {e}")
            except Exception as e:
                LOG.error(f"Error scanning {media_path}: {e}")
    
    return devices

def _get_windows_devices() -> List[Dict]:
    """Windows-specific device detection"""
    devices = []
    try:
        import string
        import win32api  # Requires pywin32
        
        for drive in string.ascii_uppercase:
            path = f"{drive}:\\"
            if os.path.exists(path):
                try:
                    total, used, free = shutil.disk_usage(path)
                    label = win32api.GetVolumeInformation(path)[0]
                    fs_type = win32api.GetVolumeInformation(path)[4]
                    
                    devices.append({
                        'device': path,
                        'mount_point': path,
                        'label': label if label else f"Local Disk ({drive}:)",
                        'filesystem': fs_type,
                        'total': total,
                        'used': used,
                        'free': free,
                        'fraction': used / total if total > 0 else 0,
                        'human_total': bytes_to_human(total),
                        'human_used': bytes_to_human(used),
                        'human_free': bytes_to_human(free),
                        'type': 'fixed' if drive != 'A' and drive != 'B' else 'removable'
                    })
                except Exception as e:
                    LOG.debug(f"Couldn't get info for {path}: {e}")
    except ImportError:
        # Fallback without win32api
        for drive in string.ascii_uppercase:
            path = f"{drive}:\\"
            if os.path.exists(path):
                try:
                    total, used, free = shutil.disk_usage(path)
                    devices.append({
                        'device': path,
                        'mount_point': path,
                        'label': f"Local Disk ({drive}:)",
                        'filesystem': 'NTFS',  # Default assumption
                        'total': total,
                        'used': used,
                        'free': free,
                        'fraction': used / total if total > 0 else 0,
                        'human_total': bytes_to_human(total),
                        'human_used': bytes_to_human(used),
                        'human_free': bytes_to_human(free),
                        'type': 'fixed' if drive != 'A' and drive != 'B' else 'removable'
                    })
                except Exception as e:
                    LOG.debug(f"Couldn't get info for {path}: {e}")
    except Exception as e:
        LOG.error(f"Error getting Windows drives: {e}")
    
    return devices

def _get_mac_devices() -> List[Dict]:
    """macOS-specific device detection"""
    devices = []
    try:
        # Get mounted volumes
        df = subprocess.run(['df', '-h'], stdout=subprocess.PIPE, text=True)
        for line in df.stdout.split('\n')[1:]:
            if line.startswith('/dev/'):
                parts = re.split(r'\s+', line.strip())
                if len(parts) >= 6:
                    mount_point = parts[-1]
                    try:
                        total, used, free = shutil.disk_usage(mount_point)
                        devices.append({
                            'device': parts[0],
                            'mount_point': mount_point,
                            'filesystem': parts[-2],
                            'total': total,
                            'used': used,
                            'free': free,
                            'fraction': used / total if total > 0 else 0,
                            'human_total': bytes_to_human(total),
                            'human_used': bytes_to_human(used),
                            'human_free': bytes_to_human(free),
                            'type': 'mounted'
                        })
                    except Exception as e:
                        LOG.debug(f"Couldn't get usage for {mount_point}: {e}")
        
        # Get additional disk info
        diskutil = subprocess.run(['diskutil', 'list'], stdout=subprocess.PIPE, text=True)
        for line in diskutil.stdout.split('\n'):
            if line.strip().startswith('/dev/'):
                disk_info = line.strip().split()
                if len(disk_info) >= 1:
                    device = {
                        'device': disk_info[0],
                        'type': 'disk'
                    }
                    if not any(d.get('device') == device['device'] for d in devices):
                        devices.append(device)
    except Exception as e:
        LOG.error(f"Error getting Mac devices: {e}")
    
    return devices


##############################################################################
# DEVICE
##############################################################################
def device_location() -> Optional[str]:
    """
    Determines the location of connected devices by checking the MEDIA and RUN paths.
    Only checks RUN path if no devices are found in MEDIA path.

    Returns:
        The base path where devices are found ('/media' or '/run'),
        or None if no devices are found or accessible.
    """
    def is_valid_device_path(path: str) -> bool:
        """Check if path exists and contains mount points that look like devices"""
        try:
            if not os.path.exists(path):
                return False
                
            entries = os.listdir(path)
            if not entries:
                return False
                
            for entry in entries:
                entry_path = os.path.join(path, entry)
                if os.path.ismount(entry_path):
                    try:
                        stat = os.statvfs(entry_path)
                        if stat.f_blocks > 0:  # Has storage capacity
                            return True
                    except OSError as e:
                        LOG.debug(f"Couldn't stat {entry_path}: {e}")
                        continue
            return False
        except (PermissionError, OSError) as e:
            LOG.warning(f"Error checking device path {path}: {e}")
            return False

    try:
        media_path = os.path.join(MEDIA, USERNAME)
        if is_valid_device_path(media_path):
            LOG.info(f"Active devices found in MEDIA path: {media_path}")
            return MEDIA
            
        run_path = os.path.join(RUN, USERNAME)
        if is_valid_device_path(run_path):
            LOG.info(f"Active devices found in RUN path: {run_path}")
            return RUN
            
    except Exception as e:
        LOG.error(f"Unexpected error while detecting devices: {e}")
        
    LOG.warning("No accessible devices found in either MEDIA or RUN paths")
    return None

def get_device_display_name(device):
    """
    Generate a user-friendly display name for a storage device.

    Args:
        device (dict): A dictionary containing device information, typically 
                      from _get_linux_devices or similar functions. It may include:
                      - 'label': Volume label of the device.
                      - 'mount_point': Mount point of the device in the filesystem.
                      - 'device': System identifier for the device (e.g., /dev/sda1).

    Returns:
        str: A user-friendly name for the device. The logic prioritizes:
             1. The device label (if available).
             2. A descriptive name based on the mount point for common locations 
                (like /media/user/device_name).
             3. The last part of the mount point if no other rule applies.
             4. The device identifier (e.g., sda1) if no mount point is available.
             5. A generic "Untitled Device" if no other information is present.
    """
    name = device.get('label')
    if name:
        return name
    
    name = device.get('mount_point')
    if name:
        if name.startswith('/media/') or name.startswith('/run/media/'):
            return name.split('/')[-1]
        return name
    
    name = device.get('device')
    if name:
        return name.split('/')[-1]
    
    return 'Untitled Device'

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    print(get_all_storage_devices())
    # print("Configured storage info:")
    # print(get_storage_info())

    # print("\nAll storage devices:")
    # for device in get_all_storage_devices():
    #     if 'mount_point' in device:
    #         print(f"{device['device']} mounted at {device['mount_point']}:")
    #         print(f"Name: {get_device_display_name(device)}")
    #         if 'human_used' in device and 'human_total' in device:
    #             print(f"  {device['human_used']} of {device['human_total']} used")
    #         else:
    #             print("  Usage information not available")
    #         if 'label' in device:
    #             print(f"  Label: {device['label']}")
    #         if 'uuid' in device:
    #             print(f"  UUID: {device['uuid']}")
    #     else:
    #         print(f"{device['device']}: {device.get('human_size', 'size unknown')}")