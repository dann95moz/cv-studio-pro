package com.cvstudio.pro;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Habilitar la depuración de WebView para inspeccionar la consola en chrome://inspect
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
