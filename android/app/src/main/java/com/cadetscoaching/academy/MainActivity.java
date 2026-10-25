package com.cadetscoaching.academy;

import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.Window;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureAdaptiveDisplayRefreshRate();
    }

    private void configureAdaptiveDisplayRefreshRate() {
        try {
            Window window = getWindow();
            if (window == null) return;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Display display = getDisplay();
                if (display != null) {
                    Display.Mode[] modes = display.getSupportedModes();
                    Display.Mode maxMode = null;
                    float maxRefreshRate = 0;
                    for (Display.Mode mode : modes) {
                        if (mode.getRefreshRate() > maxRefreshRate) {
                            maxRefreshRate = mode.getRefreshRate();
                            maxMode = mode;
                        }
                    }
                    if (maxMode != null) {
                        WindowManager.LayoutParams params = window.getAttributes();
                        params.preferredDisplayModeId = maxMode.getModeId();
                        window.setAttributes(params);
                    }
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Display display = getWindowManager().getDefaultDisplay();
                if (display != null) {
                    float[] rates = display.getSupportedRefreshRates();
                    float maxRate = 0;
                    if (rates != null && rates.length > 0) {
                        for (float rate : rates) {
                            if (rate > maxRate) {
                                maxRate = rate;
                            }
                        }
                    }
                    if (maxRate > 0) {
                        WindowManager.LayoutParams params = window.getAttributes();
                        params.preferredRefreshRate = maxRate;
                        window.setAttributes(params);
                    }
                }
            }
        } catch (Exception e) {
            // Graceful fallback to Android system defaults
        }
    }
}



