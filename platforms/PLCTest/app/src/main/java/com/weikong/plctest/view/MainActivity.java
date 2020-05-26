package com.weikong.plctest.view;

import com.weikong.plctest.R;
import com.weikong.plctest.R.layout;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.Window;
import android.view.WindowManager;


public class MainActivity extends Activity implements OnClickListener{
	
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //无title
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        //全屏
        getWindow().setFlags(WindowManager.LayoutParams. FLAG_FULLSCREEN ,      
                WindowManager.LayoutParams. FLAG_FULLSCREEN);   
        setContentView(R.layout.activity_main);
    }

    //初始化
    private void init(){
    	
    }
    
    //添加各个事件
    private void setOnClick(){
    	
    }
    
	@Override
	public void onPointerCaptureChanged(boolean hasCapture) {
		
	}

	//相关事件
	@Override
	public void onClick(View v) {
		switch(v.getId()){
			
		}
	}

}
