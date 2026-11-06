'use strict';
'require view';
'require fs';
'require form';
'require uci';
'require tools.widgets as widgets';

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(fs.stat('/sbin/block'), null),
			L.resolveDefault(fs.stat('/etc/config/fstab'), null),
			L.resolveDefault(fs.exec('/usr/sbin/rpc.nfsd', ['--version']), {}),
		]);
	},
	render: function(stats) {
		var m, s, o;

		m = new form.Map('nfs', _('NFS Shares'), _('Kernel-level NFS file sharing configuration. Allows sharing directories over the network to Linux/Unix clients.'));

		s = m.section(form.TypedSection, 'nfs', _('General Settings'));
		s.anonymous = true;

		s.tab('general',  _('General Settings'));
		s.tab('advanced', _('Advanced Settings'));
		s.tab('logs',     _('Logs'));
		
		o = s.taboption('general', form.Flag, 'enabled', _('Enable NFS server'), _('Global switch to enable or disable the NFS server service.'));
		o.rmempty = false;

		o = s.taboption('general', form.Flag, 'nfs_v3', _('Enable NFSv3'), _('Enable support for NFS version 3. Recommended for compatibility with older clients.'));
		o.default = '1';
		o.rmempty = false;

		o = s.taboption('general', form.Flag, 'nfs_v4', _('Enable NFSv4'), _('Enable support for NFS version 4. Provides better security and performance on modern networks.'));
		o.default = '1';
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'threads', _('Number of threads'), _('The number of worker threads to start. Higher values can improve performance under heavy load. Default is 16.'));
		o.datatype = 'uinteger';
		o.default = '16';
		o.placeholder = '16';

		o = s.taboption('advanced', form.Value, 'port', _('Port'), _('The port number the NFS server will listen on. Default is 2049.'));
		o.datatype = 'port';
		o.default = '2049';
		o.placeholder = '2049';

		o = s.taboption('advanced', form.Flag, 'tcp', _('Enable TCP'), _('Allow clients to connect using the TCP protocol. Recommended for reliability.'));
		o.default = '1';
		o.rmempty = false;

		o = s.taboption('advanced', form.Flag, 'udp', _('Enable UDP'), _('Allow clients to connect using the UDP protocol. Use only if required by legacy clients.'));
		o.default = '0';
		o.rmempty = false;

		o = s.taboption('logs', form.ListValue, 'log_level', _('Log Level'));
		o.value('emerg',   _('Emergency'));
		o.value('alert',   _('Alert'));
		o.value('crit',    _('Critical'));
		o.value('err',     _('Error'));
		o.value('warning', _('Warning'));
		o.value('notice',  _('Notice'));
		o.value('info',    _('Info'));
		o.value('debug',   _('Debug'));
		o.default = 'notice';

		o = s.taboption('logs', form.DummyValue, '_logs');
		o.rawhtml = true;
		o.render = function() {
			return E('div', [
				E('textarea', {
					'id': 'nfs_logs',
					'readonly': 'readonly',
					'style': 'width: 100%; height: 300px; font-family: monospace; font-size: 12px; background: #000; color: #0f0; border: 1px solid #333; padding: 10px;',
					'placeholder': _('Click "Refresh" to load logs...')
				}),
				E('div', { 'class': 'right' }, [
					E('button', {
						'class': 'btn cbi-button-apply',
						'onclick': function(ev) {
							ev.preventDefault();
							var ta = document.getElementById('nfs_logs');
							ta.value = _('Loading logs...');
							return fs.exec('logread', ['-e', 'nfs']).then(function(res) {
								if (res.stdout) {
									ta.value = res.stdout;
								} else {
									throw new Error('Empty');
								}
							}).catch(function() {
								// Fallback to dmesg if logread is empty or fails (e.g. remote logging enabled)
								return fs.exec('dmesg').then(function(res) {
									var lines = res.stdout.split('\n').filter(function(l) {
										return l.toLowerCase().indexOf('nfs') !== -1;
									});
									ta.value = lines.join('\n') || _('No NFS related logs found in logread or dmesg.');
								});
							}).then(function() {
								ta.scrollTop = ta.scrollHeight;
							});
						}
					}, _('Refresh Logs'))
				])
			]);
		};

		o = s.taboption('general', form.Button, '_apply', _('Apply Settings'), _('Generate the native configuration files and reload the NFS service.'));
		o.inputtitle = _('Apply');
		o.inputstyle = 'apply';
		o.onclick = function() {
			return fs.exec('/usr/bin/nfs-config-gen').then(function() {
				return fs.exec('/etc/init.d/nfsd', ['reload']).then(function() {
					ui.addNotification(null, E('p', _('NFS settings applied and service reloaded.')), 'info');
				});
			}).catch(function(e) {
				ui.addNotification(null, E('p', _('Failed to apply settings: %s').format(e.message)), 'error');
			});
		};


		s = m.section(form.TableSection, 'share', _('Shared Directories'),
			_('List of directories to be shared via NFS. Each entry defines a path and the clients allowed to access it.'));
		s.anonymous = true;
		s.addremove = true;

		o = s.option(form.Value, 'path', _('Path'), _('The absolute path to the directory on this system that you wish to share.'));
		if (stats[0] && stats[1]) {
			o.titleref = L.url('admin', 'system', 'mounts');
		}
		o.datatype = 'directory';
		o.rmempty = false;

		o = s.option(form.Value, 'clients', _('Allowed Clients'), _('Specify which clients can access this share. Can be a single IP, a subnet (e.g., 192.168.1.0/24), or "*" for all.'));
		o.default = '*';
		o.rmempty = false;

		o = s.option(form.Value, 'options', _('NFS Options'), _('Comma-separated list of export options. Common options: rw (read-write), sync (immediate writes), no_subtree_check (improve performance), no_root_squash (trust root user).'));
		o.default = 'rw,sync,no_subtree_check';
		o.rmempty = false;

		return m.render();
	}
});
